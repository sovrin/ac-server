import type { ClientUpdateMessage } from '@app/messages';
import type { ClientUpdatePublisher } from '@app/ports';
import type { ContainerRegistry } from '@domain/container/registry';

import type {
    AgentMessageByType,
    AgentMessageHandler,
    AgentMessageHandlerDeps,
} from './types';

export class FullStateAgentMessageHandler implements AgentMessageHandler<'full_state'> {
    readonly type = 'full_state' as const;
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
        message: AgentMessageByType<'full_state'>,
    ): void {
        registry.replaceAll(message.containers);

        const outbound: ClientUpdateMessage = {
            agentId,
            containers: registry.getAll(),
            timestamp: message.timestamp,
            type: 'full_state',
        };

        this.deps.logger.log(
            `Agent "${agentId}" full state: ${registry.size} containers`,
        );
        this.publisher.publish(outbound);
    }
}
