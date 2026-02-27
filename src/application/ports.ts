import type { ClientUpdateMessage } from '@app/messages';

export type ClientUpdatePublisher = {
    publish(message: ClientUpdateMessage): void;
};

export type Logger = {
    error(...message: [unknown, ...unknown[]]): void;
    log(...message: [unknown, ...unknown[]]): void;
};

export type LoggerFactory = {
    create(namespace: string): Logger;
};

export type Clock = {
    now(): number;
};

export type Generator = {
    id(): string;
};
