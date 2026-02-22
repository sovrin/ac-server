export type AgentPresence = {
    agentId: string;
    host: string;
    connectedAt: number;
    userAgent?: string | null;
};

export class Agent {
    private constructor(private presence: AgentPresence) {}

    static connect(args: {
        agentId: string;
        host: string;
        connectedAt: number;
        userAgent?: string | null;
    }): Agent {
        return new Agent({
            agentId: args.agentId,
            host: args.host,
            connectedAt: args.connectedAt,
            userAgent: args.userAgent ?? null,
        });
    }

    toPresence(): AgentPresence {
        return { ...this.presence };
    }
}
