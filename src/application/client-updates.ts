import type { ClientUpdateMessage } from '@app/messages';

import { EventEmitter } from 'node:events';

class ClientUpdateBus extends EventEmitter {}

export const clientUpdateBus = new ClientUpdateBus();

export const publishClientUpdate = (message: ClientUpdateMessage): void => {
    clientUpdateBus.emit('client_update', message);
};

export const onClientUpdate = (
    listener: (message: ClientUpdateMessage) => void,
): void => {
    clientUpdateBus.on('client_update', listener);
};
