import type { ContainerService } from '@app/container-service';
import type { ClientUpdateMessage } from '@app/messages';
import type { LoggerFactory } from '@app/ports';

import { onClientUpdate } from '@infra/messaging/client-update-bus';
import { WebSocket, type WebSocketServer } from 'ws';

import { ContainerEventClientTransportHandler } from './client-handlers/container-event-handler';
import { FullStateClientTransportHandler } from './client-handlers/full-state-handler';
import { ClientTransportMessageHandlerRegistry } from './client-handlers/registry';

export const setupClientWs = (
    wss: WebSocketServer,
    service: ContainerService,
    loggerFactory: LoggerFactory,
): void => {
    const log = loggerFactory.create('client:ws');
    const clients = new Set<WebSocket>();
    const handlerRegistry = new ClientTransportMessageHandlerRegistry([
        new FullStateClientTransportHandler(),
        new ContainerEventClientTransportHandler(),
    ]);

    onClientUpdate((message: ClientUpdateMessage) => {
        const payload = JSON.stringify(handlerRegistry.handle(message));

        for (const client of clients) {
            if (client.readyState !== WebSocket.OPEN) {
                continue;
            }

            client.send(payload);
        }
    });

    wss.on('connection', (ws: WebSocket) => {
        log.log(`Client connected total=${clients.size + 1}`);

        clients.add(ws);

        const snapshots = service.getFullStateForAllAgents();
        for (const snapshot of snapshots) {
            ws.send(JSON.stringify(handlerRegistry.handle(snapshot)));
        }

        ws.on('close', () => {
            clients.delete(ws);

            log.log(`Client disconnected total=${clients.size}`);
        });

        ws.on('error', (error) => {
            log.error(`Client error: ${error.message}`);
        });
    });
};
