import { pickColor, RESET, BOLD } from '../../colors';
import { isEnabled } from './filter';
import { format } from './format';

export type Debugger = {
    (...args: [unknown, ...unknown[]]): void;
    namespace: string;
    enabled: () => boolean;
    extend: (sub: string) => Debugger;
};

export const debug = (namespace: string): Debugger => {
    const color = pickColor();
    let prevTime: number | null = null;

    const elapsed = (): string => {
        const now = Date.now();

        let diff = '+0ms';
        if (prevTime) {
            diff = `+${now - prevTime}ms`;
        }

        prevTime = now;

        return diff;
    };

    const log = (formatter: unknown, ...args: unknown[]): void => {
        if (!isEnabled(namespace)) {
            return;
        }

        const message = format(formatter, args);
        const label = `${BOLD}${color}${namespace}${RESET}`;
        const timing = `${color}${elapsed()}${RESET}`;

        process.stderr.write(`${label} ${message} ${timing}\n`);
    };

    log.namespace = namespace;
    log.enabled = () => isEnabled(namespace);
    log.extend = (sub: string) => debug(`${namespace}:${sub}`);

    return log;
};
