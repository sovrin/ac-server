import type { AgentUpdateMessage } from '@app/messages';
import type { Logger } from '@app/ports';
import type { ContainerRegistry } from '@domain/container/registry';

export type AgentMessageType = AgentUpdateMessage['type'];

export type AgentMessageByType<TType extends AgentMessageType> = Extract<
    AgentUpdateMessage,
    { type: TType }
>;

export type AgentMessageHandler<TType extends AgentMessageType> = {
    readonly type: TType;
    handle(
        agentId: string,
        registry: ContainerRegistry,
        message: AgentMessageByType<TType>,
    ): void;
};

export type AgentMessageHandlerDeps = {
    logger: Logger;
};
