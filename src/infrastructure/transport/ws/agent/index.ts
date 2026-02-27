import type { ContainerService } from '@app/container-service';
import type { Generator, LoggerFactory } from '@app/ports';
import type { WebSocket, WebSocketServer } from 'ws';

import { ContainerEventTransportHandler } from '@infra/transport/ws/agent/handlers/container-event-handler';
import { FullStateTransportHandler } from '@infra/transport/ws/agent/handlers/full-state-handler';
import { AgentTransportMessageHandlerRegistry } from '@infra/transport/ws/agent/handlers/registry';
import { AgentMessageSchema } from '@infra/transport/ws/protocol';

type Setup = {
    wss: WebSocketServer;
    service: ContainerService;
    idGenerator: Generator;
    loggerFactory: LoggerFactory;
};

export const setupAgentWs = ({
    wss,
    service,
    idGenerator,
    loggerFactory,
}: Setup): void => {
    const log = loggerFactory.create('agent:ws');
    const handlerRegistry = new AgentTransportMessageHandlerRegistry([
        new FullStateTransportHandler(),
        new ContainerEventTransportHandler(),
    ]);

    wss.on('connection', (ws: WebSocket, req) => {
        const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
        const agentId =
            url.searchParams.get('id') ?? `agent-${idGenerator.id()}`;

        log.log(`Agent connected "${agentId}"`);

        ws.on('message', (raw) => {
            try {
                const json = JSON.parse(raw.toString());
                const message = AgentMessageSchema.parse(json);

                service.handleAgentMessage(
                    agentId,
                    handlerRegistry.handle(message),
                );
            } catch (error) {
                log.error(`Invalid message from "${agentId}": %s`, error);
            }
        });

        ws.on('close', () => {
            log.log(`Agent disconnected "${agentId}"`);

            service.removeAgent(agentId);
        });

        ws.on('error', (error) => {
            log.error(`Agent error "${agentId}": %s`, error);
        });
    });
};
