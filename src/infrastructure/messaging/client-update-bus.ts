import type { ClientUpdateMessage } from '@app/messages';
import type { ClientUpdatePublisher } from '@app/ports';

import { EventEmitter } from 'node:events';

class ClientUpdateBus extends EventEmitter {}

const clientUpdateBus = new ClientUpdateBus();

export const onClientUpdate = (
    listener: (message: ClientUpdateMessage) => void,
): void => {
    clientUpdateBus.on('client_update', listener);
};

export const clientUpdatePublisher: ClientUpdatePublisher = {
    publish(message) {
        clientUpdateBus.emit('client_update', message);
    },
};
