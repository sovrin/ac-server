import type { AgentUpdateMessage } from '@app/messages';

import type {
    AgentTransportMessageHandler,
    TransportAgentMessageByType,
} from './types';

export class ContainerEventTransportHandler implements AgentTransportMessageHandler<'container_event'> {
    readonly type = 'container_event' as const;

    handle(
        message: TransportAgentMessageByType<'container_event'>,
    ): AgentUpdateMessage {
        return {
            container: { ...message.container },
            event: message.event,
            timestamp: message.timestamp,
            type: 'container_event',
        };
    }
}
