import type { Server as HttpServer } from 'http';
import { type WebSocket, WebSocketServer } from 'ws';

import { store } from './store';
import type { AgentPresence } from './types';
import { AgentHelloSchema } from './types';
import { getGroupedApps } from './utils';

const channels = {
    apps: new Set<WebSocket>(),
    agents: new Set<WebSocket>(),
};

const agentStore = new Map<string, AgentPresence>();

export function init(server: HttpServer): void {
    const wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (req, socket, head) => {
        const { pathname } = new URL(
            req.url ?? '/',
            `http://${req.headers.host}`,
        );

        if (pathname === '/ws/apps' || pathname === '/ws/agents') {
            wss.handleUpgrade(req, socket, head, (ws) => {
                wss.emit('connection', ws, req, pathname);
            });
        } else {
            socket.destroy();
        }
    });

    wss.on('connection', (ws: WebSocket, req, pathname: string) => {
        if (pathname === '/ws/apps') {
            handleAppsConnection(ws);
        } else if (pathname === '/ws/agents') {
            handleAgentsConnection(ws, req);
        }
    });
}

/** Broadcast the full app list to /ws/apps clients */
export function broadcast(): void {
    const payload = JSON.stringify({
        type: 'snapshot',
        data: getGroupedApps(store),
    });

    for (const client of channels.apps) {
        if (client.readyState === client.OPEN) {
            client.send(payload);
        }
    }
}

/** Get connected agents (for the REST endpoint) */
export function getAgents(): Record<string, AgentPresence[]> {
    const agents = [...agentStore.values()].sort((a, b) =>
        a.host.localeCompare(b.host),
    );
    return agents.reduce<Record<string, AgentPresence[]>>((acc, a) => {
        (acc[a.host] ??= []).push(a);
        return acc;
    }, {});
}

// ── connection handlers ─────────────────────────────────

function handleAppsConnection(ws: WebSocket): void {
    channels.apps.add(ws);
    ws.send(JSON.stringify({ type: 'snapshot', data: getGroupedApps(store) }));
    ws.on('close', () => channels.apps.delete(ws));
    ws.on('error', () => channels.apps.delete(ws));
}

function handleAgentsConnection(
    ws: WebSocket,
    req: { headers: Record<string, string | undefined> },
): void {
    channels.agents.add(ws);
    let registeredAgentId: string | null = null;

    ws.on('message', (raw) => {
        let msg: unknown;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }

        const parsed = AgentHelloSchema.safeParse(msg);
        if (!parsed.success) return;

        const { agentId, host, userAgent } = parsed.data;
        registeredAgentId = agentId;

        agentStore.set(agentId, {
            agentId,
            host,
            connectedAt: Date.now(),
            userAgent: userAgent ?? req.headers['user-agent'] ?? null,
        });

        ws.send(JSON.stringify({ type: 'agent_ack', ok: true }));
    });

    const cleanup = () => {
        channels.agents.delete(ws);
        if (registeredAgentId) agentStore.delete(registeredAgentId);
    };
    ws.on('close', cleanup);
    ws.on('error', cleanup);
}
