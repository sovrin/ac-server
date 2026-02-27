import type { AgentUpdateMessage } from '@app/messages';
import type { ContainerRegistry } from '@domain/container/registry';

import type { AgentMessageHandler, AgentMessageType } from './types';

export class AgentMessageHandlerRegistry {
    private readonly handlers = new Map<
        AgentMessageType,
        AgentMessageHandler<AgentMessageType>
    >();

    constructor(handlers: AgentMessageHandler<AgentMessageType>[]) {
        for (const handler of handlers) {
            this.handlers.set(handler.type, handler);
        }
    }

    get(type: AgentMessageType): AgentMessageHandler<AgentMessageType> {
        const handler = this.handlers.get(type);
        if (!handler) {
            throw new Error(
                `No agent message handler registered for "${type}"`,
            );
        }

        return handler;
    }

    handle(
        agentId: string,
        registry: ContainerRegistry,
        message: AgentUpdateMessage,
    ): void {
        const handler = this.get(message.type);

        handler.handle(agentId, registry, message as never);
    }
}
