import { CHECK_TIMEOUT_MS } from './config';
import { store } from './store';
import type { AppPayload, AppRecord, Status } from './types';
import { buildHealthUrl } from './utils';
import { broadcast } from './ws';

export async function probeApp(a: AppPayload): Promise<{
    status: Status;
    responseTimeMs: number | null;
    timedOut: boolean;
    lastError: string | null;
}> {
    const url = buildHealthUrl(a);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

    const start = performance.now();
    try {
        const resp = await fetch(url, {
            method: 'GET',
            signal: controller.signal,
            headers: { 'cache-control': 'no-cache' },
        });

        const ms = Math.round(performance.now() - start);

        if (resp.ok) {
            return {
                status: 'online',
                responseTimeMs: ms,
                timedOut: false,
                lastError: null,
            };
        }

        return {
            status: 'offline',
            responseTimeMs: ms,
            timedOut: false,
            lastError: `HTTP ${resp.status}`,
        };
    } catch (err: any) {
        const timedOut = err?.name === 'AbortError';
        return {
            status: 'offline',
            responseTimeMs: null,
            timedOut,
            lastError: timedOut ? 'timeout' : (err?.message ?? 'fetch error'),
        };
    } finally {
        clearTimeout(timeout);
    }
}

let checkerRunning = false;

export async function runCheckerTick(): Promise<void> {
    if (checkerRunning) return;
    checkerRunning = true;

    try {
        const entries = [...store.entries()];
        const now = Date.now();

        await Promise.all(
            entries.map(async ([key, record]) => {
                if (record.lifecycle === 'deleted') return;
                if (record.lifecycle === 'stopped') {
                    // keep them offline, but update lastCheckedAt occasionally if you want (optional)
                    store.set(key, {
                        ...record,
                        status: 'offline',
                        lastCheckedAt: record.lastCheckedAt ?? now,
                    });
                    return;
                }

                const r = await probeApp(record);
                store.set(key, {
                    ...record,
                    status: r.status,
                    lastCheckedAt: now,
                    responseTimeMs: r.responseTimeMs,
                    timedOut: r.timedOut,
                    lastError: r.lastError,
                });

                broadcast();
            }),
        );
    } finally {
        checkerRunning = false;
    }
}
