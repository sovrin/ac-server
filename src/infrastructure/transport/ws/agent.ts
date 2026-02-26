import type { ContainerService } from '@app/container-service';
import type { AgentUpdateMessage } from '@app/messages';
import type { WebSocket, WebSocketServer } from 'ws';

import {
    AgentMessageSchema,
    type AgentMessage as TransportAgentMessage,
} from '@infra/schemas';

const mapAgentMessage = (
    message: TransportAgentMessage,
): AgentUpdateMessage => {
    switch (message.type) {
        case 'full_state':
            return {
                containers: message.containers.map((container) => ({
                    ...container,
                })),
                timestamp: message.timestamp,
                type: 'full_state',
            };

        case 'container_event':
            return {
                container: { ...message.container },
                event: message.event,
                timestamp: message.timestamp,
                type: 'container_event',
            };
    }
};

export const setupAgentWs = (
    wss: WebSocketServer,
    service: ContainerService,
): void => {
    wss.on('connection', (ws: WebSocket, req) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const agentId =
            url.searchParams.get('id') ??
            `agent-${Math.random().toString(36).substring(2, 8)}`;

        console.log(`[agent][ws] Agent connected: ${agentId}`);

        ws.on('message', (raw) => {
            try {
                const json = JSON.parse(raw.toString());
                const message = AgentMessageSchema.parse(json);
                service.handleAgentMessage(agentId, mapAgentMessage(message));
            } catch (error) {
                console.error(
                    `[agent][ws] Invalid message from ${agentId}:`,
                    error instanceof Error ? error.message : error,
                );
            }
        });

        ws.on('close', () => {
            console.log(`[agent][ws] Agent disconnected: ${agentId}`);

            // Service.removeAgent(agentId);
        });

        ws.on('error', (error) => {
            console.error(
                `[agent][ws] Agent error: ${agentId}:`,
                error instanceof Error ? error.message : error,
            );
        });
    });
};
