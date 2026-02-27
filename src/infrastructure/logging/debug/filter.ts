import { env } from '@infra/config/env';

export const isEnabled = (namespace: string): boolean => {
    const debug = env.DEBUG;
    if (!debug) {
        return false;
    }

    return debug.split(',').some((pattern) => {
        const trimmed = pattern.trim();
        if (trimmed === '*') {
            return true;
        }

        const regex = new RegExp(`^${trimmed.replace(/\*/g, '.*')}$`);

        return regex.test(namespace);
    });
};
