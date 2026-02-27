import type { AgentUpdateMessage } from '@app/messages';
import type { TransportAgentMessage } from '@infra/transport/ws/protocol';

import { MessageHandlerRegistry } from '@infra/transport/ws/handler-registry';

import type {
    AgentTransportMessageHandler,
    TransportAgentMessageType,
} from './types';

export class AgentTransportMessageHandlerRegistry {
    private readonly registry: MessageHandlerRegistry<
        TransportAgentMessage,
        AgentUpdateMessage,
        AgentTransportMessageHandler<TransportAgentMessageType>
    >;

    constructor(
        handlers: AgentTransportMessageHandler<TransportAgentMessageType>[],
    ) {
        this.registry = new MessageHandlerRegistry('WS agent', handlers);
    }

    handle(message: TransportAgentMessage): AgentUpdateMessage {
        return this.registry.handle(message);
    }
}
