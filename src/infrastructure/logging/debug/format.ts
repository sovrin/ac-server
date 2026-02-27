type Arg = string | number | object | unknown;

const JSON_INDENT = 2;

export const format = (formatter: unknown, args: Arg[]): string => {
    let index = 0;

    const message = String(formatter).replace(
        /%([sdoj%])/g,
        (match, type: string) => {
            if (type === '%') {
                return '%';
            }

            const arg = args[index++];

            switch (type) {
                case 's':
                    return String(arg);
                case 'd':
                    return String(Number(arg));
                case 'o':
                    return JSON.stringify(arg, null, JSON_INDENT);
                case 'j':
                    return JSON.stringify(arg);
                default:
                    return match;
            }
        },
    );

    const remaining = args.slice(index).map((input: unknown) => {
        if (typeof input === 'object') {
            return JSON.stringify(input);
        }

        return String(input);
    });

    return [message, ...remaining].filter(Boolean).join(' ');
};
