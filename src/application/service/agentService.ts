import type { AgentRepository } from '../../domain/ports';
import type { AgentPresence } from '../../domain/agent';

export type GroupedAgents = Record<string, AgentPresence[]>;

export class AgentService {
    constructor(private readonly repo: AgentRepository) {}

    listGrouped(): GroupedAgents {
        const agents = this.repo.list().sort((a, b) =>
            a.host.localeCompare(b.host),
        );
        return agents.reduce<GroupedAgents>((acc, a) => {
            (acc[a.host] ??= []).push(a);
            return acc;
        }, {});
    }
}
