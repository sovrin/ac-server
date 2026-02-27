import type { AgentUpdateMessage } from '@app/messages';
import type { MessageHandler } from '@infra/transport/ws/handler-registry';
import type { TransportAgentMessage } from '@infra/transport/ws/protocol';

export type TransportAgentMessageType = TransportAgentMessage['type'];

export type TransportAgentMessageByType<
    TType extends TransportAgentMessageType,
> = Extract<TransportAgentMessage, { type: TType }>;

export type AgentTransportMessageHandler<
    TType extends TransportAgentMessageType,
> = MessageHandler<TransportAgentMessage, AgentUpdateMessage, TType>;
