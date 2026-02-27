import type { AgentUpdateMessage } from '@app/messages';

import type {
    AgentTransportMessageHandler,
    TransportAgentMessageByType,
} from './types';

export class FullStateTransportHandler implements AgentTransportMessageHandler<'full_state'> {
    readonly type = 'full_state' as const;

    handle(
        message: TransportAgentMessageByType<'full_state'>,
    ): AgentUpdateMessage {
        return {
            containers: message.containers.map((container) => ({
                ...container,
            })),
            timestamp: message.timestamp,
            type: 'full_state',
        };
    }
}
