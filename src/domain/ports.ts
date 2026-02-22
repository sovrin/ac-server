import type { AppPayload, AppRecord, ProbeResult } from './app';
import type { AgentPresence } from './agent';

export interface AppRepository {
    get(key: string): AppRecord | undefined;
    set(key: string, record: AppRecord): void;
    delete(key: string): void;
    list(): AppRecord[];
    entries(): [string, AppRecord][];
    save(): Promise<void>;
}

export interface AgentRepository {
    upsert(agent: AgentPresence): void;
    remove(agentId: string): void;
    list(): AgentPresence[];
    save(): Promise<void>;
}

export interface HealthProbe {
    probe(app: AppPayload): Promise<ProbeResult>;
}

export interface Clock {
    now(): number;
}
