import type { AgentUpdateMessage, ClientUpdateMessage } from '@app/messages';
import type {
    ClientUpdatePublisher,
    Clock,
    Logger,
    LoggerFactory,
} from '@app/ports';

import { ContainerEventAgentMessageHandler } from '@app/agent-message-handlers/container-event-handler';
import { FullStateAgentMessageHandler } from '@app/agent-message-handlers/full-state-handler';
import { AgentMessageHandlerRegistry } from '@app/agent-message-handlers/registry';
import { ContainerRegistry } from '@domain/container/registry';

export class ContainerService {
    private registries = new Map<string, ContainerRegistry>();
    private readonly logger: Logger;
    private readonly clock: Clock;
    private readonly handlerRegistry: AgentMessageHandlerRegistry;

    constructor(deps: {
        publisher: ClientUpdatePublisher;
        logger: LoggerFactory;
        clock: Clock;
    }) {
        this.logger = deps.logger.create('service');
        this.clock = deps.clock;
        this.handlerRegistry = new AgentMessageHandlerRegistry([
            new FullStateAgentMessageHandler(deps.publisher, {
                logger: this.logger,
            }),
            new ContainerEventAgentMessageHandler(deps.publisher, {
                logger: this.logger,
            }),
        ]);
    }

    handleAgentMessage(agentId: string, message: AgentUpdateMessage): void {
        const registry = this.getOrCreateRegistry(agentId);
        this.handlerRegistry.handle(agentId, registry, message);
    }

    getFullStateForAllAgents(): ClientUpdateMessage[] {
        const messages: ClientUpdateMessage[] = [];

        for (const [agentId, registry] of this.registries) {
            messages.push({
                agentId,
                containers: registry.getAll(),
                timestamp: this.clock.now(),
                type: 'full_state',
            });
        }

        return messages;
    }

    removeAgent(agentId: string): void {
        this.registries.delete(agentId);
        this.logger.log(`Agent "${agentId}" removed.`);
    }

    private getOrCreateRegistry(agentId: string): ContainerRegistry {
        let registry = this.registries.get(agentId);
        if (!registry) {
            registry = new ContainerRegistry();

            this.registries.set(agentId, registry);
        }

        return registry;
    }
}
