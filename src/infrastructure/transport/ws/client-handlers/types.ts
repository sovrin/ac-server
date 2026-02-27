import type { ClientUpdateMessage } from '@app/messages';
import type { MessageHandler } from '@infra/transport/ws/handler-registry';
import type { TransportClientMessage } from '@infra/transport/ws/protocol';

export type ClientUpdateMessageType = ClientUpdateMessage['type'];

export type ClientUpdateMessageByType<TType extends ClientUpdateMessageType> =
    Extract<ClientUpdateMessage, { type: TType }>;

export type ClientTransportMessageHandler<
    TType extends ClientUpdateMessageType,
> = MessageHandler<ClientUpdateMessage, TransportClientMessage, TType>;
