import type { ContainerService } from '@app/container-service';
import type { ClientUpdateMessage } from '@app/messages';
import type { ClientMessage } from '@infra/schemas';

import { onClientUpdate } from '@app/client-updates';
import { WebSocket, type WebSocketServer } from 'ws';

const mapClientMessage = (message: ClientUpdateMessage): ClientMessage => {
    switch (message.type) {
        case 'full_state':
            return {
                agentId: message.agentId,
                containers: message.containers.map((container) => ({
                    ...container,
                })),
                timestamp: message.timestamp,
                type: 'full_state',
            };

        case 'container_event':
            return {
                agentId: message.agentId,
                container: { ...message.container },
                event: message.event,
                timestamp: message.timestamp,
                type: 'container_event',
            };
    }
};

export const setupClientWs = (
    wss: WebSocketServer,
    service: ContainerService,
): void => {
    const clients = new Set<WebSocket>();

    onClientUpdate((message: ClientUpdateMessage) => {
        const payload = JSON.stringify(mapClientMessage(message));

        for (const client of clients) {
            if (client.readyState !== WebSocket.OPEN) {
                continue;
            }

            client.send(payload);
        }
    });

    wss.on('connection', (ws: WebSocket) => {
        console.log(
            `[client][ws] Client connected (total: ${clients.size + 1})`,
        );

        clients.add(ws);

        const snapshots = service.getFullStateForAllAgents();
        for (const snapshot of snapshots) {
            ws.send(JSON.stringify(mapClientMessage(snapshot)));
        }

        ws.on('close', () => {
            clients.delete(ws);

            console.log(
                `[client][ws] Client disconnected (total: ${clients.size})`,
            );
        });

        ws.on('error', (error) => {
            console.error('[client][ws] Client error:', error.message);
        });
    });
};
