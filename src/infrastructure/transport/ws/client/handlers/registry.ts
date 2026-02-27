import type { ClientUpdateMessage } from '@app/messages';
import type { TransportClientMessage } from '@infra/transport/ws/client/protocol';

import { MessageHandlerRegistry } from '@infra/transport/ws/handler-registry';

import type {
    ClientTransportMessageHandler,
    ClientUpdateMessageType,
} from './types';

export class ClientTransportMessageHandlerRegistry {
    private readonly registry: MessageHandlerRegistry<
        ClientUpdateMessage,
        TransportClientMessage,
        ClientTransportMessageHandler<ClientUpdateMessageType>
    >;

    constructor(
        handlers: ClientTransportMessageHandler<ClientUpdateMessageType>[],
    ) {
        this.registry = new MessageHandlerRegistry('WS client', handlers);
    }

    handle(message: ClientUpdateMessage): TransportClientMessage {
        return this.registry.handle(message);
    }
}
