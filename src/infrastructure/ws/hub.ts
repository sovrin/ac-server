import type { Server as HttpServer } from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';

import type { AgentCommandService } from '../../application/agentCommandService';
import type { AppQueryService } from '../../application/appQueryService';
import type { AppSnapshotPublisher } from '../../application/ports';
import { AgentHelloSchema } from './schemas';

export type WsHub = {
    init(server: HttpServer): void;
} & AppSnapshotPublisher;

export class WsHubImpl implements WsHub {
    private readonly appsClients = new Set<WebSocket>();
    private readonly agentClients = new Set<WebSocket>();

    constructor(
        private readonly appQueries: AppQueryService,
        private readonly agentCommands: AgentCommandService,
    ) {}

    init(server: HttpServer): void {
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
                this.handleAppsConnection(ws);
            } else if (pathname === '/ws/agents') {
                this.handleAgentsConnection(ws, req);
            }
        });
    }

    publishAppsSnapshot(): void {
        const payload = JSON.stringify({
            type: 'snapshot',
            data: this.appQueries.listGrouped(),
        });

        for (const client of this.appsClients) {
            if (client.readyState === client.OPEN) {
                client.send(payload);
            }
        }
    }

    private handleAppsConnection(ws: WebSocket): void {
        this.appsClients.add(ws);
        ws.send(
            JSON.stringify({
                type: 'snapshot',
                data: this.appQueries.listGrouped(),
            }),
        );
        ws.on('close', () => this.appsClients.delete(ws));
        ws.on('error', () => this.appsClients.delete(ws));
    }

    private handleAgentsConnection(
        ws: WebSocket,
        req: { headers: Record<string, string | undefined> },
    ): void {
        this.agentClients.add(ws);
        let registeredAgentId: string | null = null;

        ws.on('message', (raw) => {
            let msg: unknown;
            try {
                msg = JSON.parse(raw.toString());
            } catch {
                return;
            }

            const parsed = AgentHelloSchema.safeParse(msg);
            if (!parsed.success) {
                return;
            }
            const payload = parsed.data;

            registeredAgentId = payload.agentId;

            void this.agentCommands.registerHello({
                agentId: payload.agentId,
                host: payload.host,
                userAgent:
                    typeof payload.userAgent === 'string'
                        ? payload.userAgent
                        : req.headers['user-agent'] ?? null,
            });

            ws.send(JSON.stringify({ type: 'agent_ack', ok: true }));
        });

        const cleanup = () => {
            this.agentClients.delete(ws);
            if (registeredAgentId) {
                void this.agentCommands.disconnect(registeredAgentId);
            }
        };
        ws.on('close', cleanup);
        ws.on('error', cleanup);
    }
}
