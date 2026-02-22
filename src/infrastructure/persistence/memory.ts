import type { AgentPresence } from '../../domain/agent';
import type { AppRecord } from '../../domain/app';
import type { AgentRepository, AppRepository } from '../../domain/ports';

export class InMemoryAppRepository implements AppRepository {
    private readonly data = new Map<string, AppRecord>();

    get(key: string): AppRecord | undefined {
        return this.data.get(key);
    }

    set(key: string, record: AppRecord): void {
        this.data.set(key, record);
    }

    delete(key: string): void {
        this.data.delete(key);
    }

    list(): AppRecord[] {
        return [...this.data.values()];
    }

    entries(): [string, AppRecord][] {
        return [...this.data.entries()];
    }

    async save(): Promise<void> {
        return;
    }
}

export class InMemoryAgentRepository implements AgentRepository {
    private readonly data = new Map<string, AgentPresence>();

    upsert(a: AgentPresence): void {
        this.data.set(a.agentId, a);
    }

    remove(agentId: string): void {
        this.data.delete(agentId);
    }

    list(): AgentPresence[] {
        return [...this.data.values()];
    }

    async save(): Promise<void> {
        return;
    }
}

export async function createInMemoryRepositories(): Promise<{
    appRepository: AppRepository;
    agentRepository: AgentRepository;
}> {
    return {
        appRepository: new InMemoryAppRepository(),
        agentRepository: new InMemoryAgentRepository(),
    };
}
