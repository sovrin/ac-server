import { JSONFilePreset } from 'lowdb/node';

import type { AgentPresence } from '../../domain/agent';
import type { AppRecord } from '../../domain/app';
import type { AgentRepository, AppRepository } from '../../domain/ports';

type DbSchema = {
    apps: Record<string, AppRecord>;
    agents: Record<string, AgentPresence>;
};

const defaultData: DbSchema = { apps: {}, agents: {} };

class LowdbAppRepository implements AppRepository {
    private constructor(
        private readonly db: {
            data: DbSchema;
            write: () => Promise<void>;
        },
    ) {}

    get(key: string): AppRecord | undefined {
        return this.db.data.apps[key];
    }

    set(key: string, record: AppRecord): void {
        this.db.data.apps[key] = record;
    }

    delete(key: string): void {
        delete this.db.data.apps[key];
    }

    list(): AppRecord[] {
        return Object.values(this.db.data.apps);
    }

    entries(): [string, AppRecord][] {
        return Object.entries(this.db.data.apps);
    }

    async save(): Promise<void> {
        await this.db.write();
    }
}

class LowdbAgentRepository implements AgentRepository {
    constructor(
        private readonly db: {
            data: DbSchema;
            write: () => Promise<void>;
        },
    ) {}

    upsert(agent: AgentPresence): void {
        this.db.data.agents[agent.agentId] = agent;
    }

    remove(agentId: string): void {
        delete this.db.data.agents[agentId];
    }

    list(): AgentPresence[] {
        return Object.values(this.db.data.agents);
    }

    async save(): Promise<void> {
        await this.db.write();
    }
}

export async function createLowdbRepositories(path: string): Promise<{
    appRepository: AppRepository;
    agentRepository: AgentRepository;
}> {
    const db = await JSONFilePreset<DbSchema>(path, defaultData);

    return {
        appRepository: new LowdbAppRepository(db),
        agentRepository: new LowdbAgentRepository(db),
    };
}
