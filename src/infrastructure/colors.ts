const ANSI_COLORS = [
    '\x1b[36m',
    '\x1b[33m',
    '\x1b[35m',
    '\x1b[34m',
    '\x1b[32m',
    '\x1b[31m',
];
export const RESET = '\x1b[0m';
export const BOLD = '\x1b[1m';

let index = 0;

export const pickColor = (): string =>
    ANSI_COLORS[index++ % ANSI_COLORS.length];
