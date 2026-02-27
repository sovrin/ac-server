import type { TransportClientMessage } from '@infra/transport/ws/client/protocol';

import type {
    ClientTransportMessageHandler,
    ClientUpdateMessageByType,
} from './types';

export class ContainerEventClientTransportHandler implements ClientTransportMessageHandler<'container_event'> {
    readonly type = 'container_event' as const;

    handle(
        message: ClientUpdateMessageByType<'container_event'>,
    ): TransportClientMessage {
        return {
            agentId: message.agentId,
            container: { ...message.container },
            event: message.event,
            timestamp: message.timestamp,
            type: 'container_event',
        };
    }
}
