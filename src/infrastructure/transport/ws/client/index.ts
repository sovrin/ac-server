import type { ContainerService } from '@app/container-service';
import type { ClientUpdateMessage } from '@app/messages';
import type { LoggerFactory } from '@app/ports';

import { onClientUpdate } from '@infra/messaging/client-update-bus';
import { ContainerEventClientTransportHandler } from '@infra/transport/ws/client/handlers/container-event-handler';
import { FullStateClientTransportHandler } from '@infra/transport/ws/client/handlers/full-state-handler';
import { ClientTransportMessageHandlerRegistry } from '@infra/transport/ws/client/handlers/registry';
import { WebSocket, type WebSocketServer } from 'ws';

type Setup = {
    wss: WebSocketServer;
    service: ContainerService;
    loggerFactory: LoggerFactory;
};

export const setupClientWs = ({ wss, service, loggerFactory }: Setup): void => {
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

        log.log(`Client connected total=${clients.size}`);
    });
};
