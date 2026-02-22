import { Agent } from '../../domain/agent';
import type { AgentRepository, Clock } from '../../domain/ports';

export class AgentCommandService {
    constructor(
        private readonly agentRepository: AgentRepository,
        private readonly clock: Clock,
    ) {}

    async registerHello(input: {
        agentId: string;
        host: string;
        userAgent?: string | null;
    }): Promise<void> {
        const agent = Agent.connect({
            ...input,
            connectedAt: this.clock.now(),
        });
        this.agentRepository.upsert(agent.toPresence());
        await this.agentRepository.save();
    }

    async disconnect(agentId: string): Promise<void> {
        this.agentRepository.remove(agentId);
        await this.agentRepository.save();
    }
}
