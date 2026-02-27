import type { ClientUpdateMessage } from '@app/messages';
import type { ClientUpdatePublisher } from '@app/ports';
import type { ContainerRegistry } from '@domain/container/registry';

import type {
    AgentMessageByType,
    AgentMessageHandler,
    AgentMessageHandlerDeps,
} from './types';

export class ContainerEventAgentMessageHandler implements AgentMessageHandler<'container_event'> {
    readonly type = 'container_event' as const;
    private readonly publisher: ClientUpdatePublisher;
    private readonly deps: AgentMessageHandlerDeps;

    constructor(
        publisher: ClientUpdatePublisher,
        deps: AgentMessageHandlerDeps,
    ) {
        this.publisher = publisher;
        this.deps = deps;
    }

    handle(
        agentId: string,
        registry: ContainerRegistry,
        message: AgentMessageByType<'container_event'>,
    ): void {
        registry.applyEvent(message.event, message.container);

        const outbound: ClientUpdateMessage = {
            agentId,
            container: message.container,
            event: message.event,
            timestamp: message.timestamp,
            type: 'container_event',
        };

        this.deps.logger.log(
            `Agent "${agentId}" event: ${message.event} -> ${message.container.name}`,
        );
        this.publisher.publish(outbound);
    }
}
