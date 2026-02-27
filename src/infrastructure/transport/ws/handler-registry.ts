type TypedMessage = { type: string };

export type MessageHandler<
    TMessage extends TypedMessage,
    TResult,
    TType extends TMessage['type'] = TMessage['type'],
> = {
    readonly type: TType;
    handle(message: Extract<TMessage, { type: TType }>): TResult;
};

export class MessageHandlerRegistry<
    TMessage extends TypedMessage,
    TResult,
    THandler extends MessageHandler<TMessage, TResult, TMessage['type']> =
        MessageHandler<TMessage, TResult, TMessage['type']>,
> {
    private readonly handlers = new Map<TMessage['type'], THandler>();
    private readonly scope: string;

    constructor(scope: string, handlers: THandler[]) {
        this.scope = scope;

        for (const handler of handlers) {
            this.handlers.set(handler.type, handler);
        }
    }

    handle(message: TMessage): TResult {
        const handler = this.handlers.get(message.type);
        if (!handler) {
            throw new Error(
                `No ${this.scope} handler registered for "${message.type}"`,
            );
        }

        return handler.handle(message as never);
    }
}
