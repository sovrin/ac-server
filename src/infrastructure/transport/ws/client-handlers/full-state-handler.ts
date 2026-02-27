import type { TransportClientMessage } from '@infra/transport/ws/protocol';

import type {
    ClientTransportMessageHandler,
    ClientUpdateMessageByType,
} from './types';

export class FullStateClientTransportHandler implements ClientTransportMessageHandler<'full_state'> {
    readonly type = 'full_state' as const;

    handle(
        message: ClientUpdateMessageByType<'full_state'>,
    ): TransportClientMessage {
        return {
            agentId: message.agentId,
            containers: message.containers.map((container) => ({
                ...container,
            })),
            timestamp: message.timestamp,
            type: 'full_state',
        };
    }
}
