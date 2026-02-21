import { type Request, type Response, Router } from 'express';
import { z } from 'zod';

import { probeApp } from './healthcheck';
import { store } from './store';
import type { LifecycleUpdate } from './types';
import {
    AppPayloadSchema,
    type AppRecord,
    LifecycleUpdateSchema,
} from './types';
import { getGroupedApps, groupByHost, makeKey } from './utils';
import { broadcast } from './ws';

export const router = Router();

// POST /apps — register / update app
router.post('/apps', (req: Request, res: Response) => {
    const parsed = AppPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: z.treeifyError(parsed.error),
        });
    }

    const payload = parsed.data;
    const key = makeKey(payload);
    const now = Date.now();
    const existing = store.get(key);

    const record: AppRecord = {
        ...payload,
        key,
        registeredAt: existing?.registeredAt ?? now,
        updatedAt: now,
        lifecycle: existing?.lifecycle ?? 'running',

        status: existing?.status ?? 'offline',
        lastCheckedAt: existing?.lastCheckedAt ?? null,
        responseTimeMs: existing?.responseTimeMs ?? null,
        timedOut: existing?.timedOut ?? false,
        lastError: existing?.lastError ?? null,
    };

    // If it was deleted, a new POST resurrects it as running (sensible default)
    if (record.lifecycle === 'deleted') record.lifecycle = 'running';

    store.set(key, record);
    void store.save();

    // Immediate probe for faster UI feedback (only if running)
    if (record.lifecycle === 'running') {
        void (async () => {
            const r = await probeApp(payload);
            const current = store.get(key);
            if (!current) return;
            store.set(key, {
                ...current,
                status: r.status,
                lastCheckedAt: Date.now(),
                responseTimeMs: r.responseTimeMs,
                timedOut: r.timedOut,
                lastError: r.lastError,
            });

            await store.save();

            broadcast();
        })();
    }

    return res.status(200).json({ ok: true, app: store.get(key) });
});

// Lifecycle update (stopped/deleted/running)
router.patch('/apps/lifecycle', (req: Request, res: Response) => {
    const parsed = LifecycleUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid payload',
            details: z.treeifyError(parsed.error),
        });
    }

    const u: LifecycleUpdate = parsed.data;
    const key = makeKey(u);
    const existing = store.get(key);

    if (!existing) {
        // Option A: create a placeholder entry (useful when stop/destroy arrives before register)
        const placeholder: AppRecord = {
            key,
            name: u.name,
            port: u.port,
            host: u.host,
            icon: '🐳',
            registeredAt: Date.now(),
            updatedAt: Date.now(),
            lifecycle: u.lifecycle,
            status: 'offline',
            lastCheckedAt: null,
            responseTimeMs: null,
            timedOut: true,
            lastError: `lifecycle:${u.lifecycle}`,
        };
        store.set(key, placeholder);
        void store.save();
        broadcast();

        return res.json({ ok: true, created: true });
    }

    const updated: AppRecord = {
        ...existing,
        updatedAt: Date.now(),
        lifecycle: u.lifecycle,
    };

    // If not running, force offline
    if (u.lifecycle !== 'running') {
        updated.status = 'offline';
        updated.responseTimeMs = null;
        updated.timedOut = true;
        updated.lastError = `lifecycle:${u.lifecycle}`;
    }

    store.set(key, updated);
    void store.save();

    broadcast();

    // If switched to running, probe now
    if (u.lifecycle === 'running') {
        void (async () => {
            const r = await probeApp(existing);
            const current = store.get(key);
            if (!current) return;

            store.set(key, {
                ...current,
                status: r.status,
                lastCheckedAt: Date.now(),
                responseTimeMs: r.responseTimeMs,
                timedOut: r.timedOut,
                lastError: r.lastError,
            });

            await store.save();
            broadcast();
        })();
    }

    return res.json({ ok: true });
});

// GET /apps — list all apps grouped by host
router.get('/apps', (_req: Request, res: Response) => {
    const apps = getGroupedApps(store);

    return res.json(apps);
});

// DELETE /apps — remove an app by key
router.delete('/apps', (req: Request, res: Response) => {
    const key = req.query.key;
    store.delete(key as string);

    void store.save();

    broadcast();

    return res.status(200).json({ ok: true });
});

// Local health for this monitor server
router.get('/health', (_req, res) => {
    return res.json({ ok: true });
});
