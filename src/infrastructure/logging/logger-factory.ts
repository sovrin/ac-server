import type { Logger, LoggerFactory } from '@app/ports';

import { debug } from '@infra/logging/debug';

export const debugLoggerFactory: LoggerFactory = {
    create(namespace: string): Logger {
        const writer = debug(namespace);

        return {
            error(message: string | Error): void {
                if (message instanceof Error) {
                    if (message.stack) {
                        writer('%j', message.stack);
                    } else {
                        writer('%s', message.message);
                    }

                    return;
                }

                writer('%s', message);
            },
            log(message: string): void {
                writer('%s', message);
            },
        };
    },
};
