import type { Generator } from '@app/ports';

const RADIX = 36;
const SUBSTRING_START = 2;
const SUBSTRING_END = 8;

export const idGenerator: Generator = {
    id(): string {
        return Math.random()
            .toString(RADIX)
            .substring(SUBSTRING_START, SUBSTRING_END);
    },
};
