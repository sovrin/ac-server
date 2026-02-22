export type Status = 'online' | 'offline';
export type Lifecycle = 'running' | 'stopped' | 'deleted';

export type AppPayload = {
    name: string;
    host: string;
    port: number;
    icon: string;
};

export type AppRecord = AppPayload & {
    key: string;
    registeredAt: number;
    updatedAt: number;
    lifecycle: Lifecycle;
    status: Status;
    lastCheckedAt: number | null;
    responseTimeMs: number | null;
    timedOut: boolean;
    lastError: string | null;
};

export type ProbeResult = {
    status: Status;
    responseTimeMs: number | null;
    timedOut: boolean;
    lastError: string | null;
};

export function makeAppKey(a: { host: string; name: string; port: number }): string {
    return `${a.host}::${a.name}::${a.port}`;
}

export class App {
    private constructor(private record: AppRecord) {}

    static fromRecord(record: AppRecord): App {
        return new App({ ...record });
    }

    static registerOrRefresh(args: {
        payload: AppPayload;
        now: number;
        existing?: AppRecord;
    }): App {
        const { payload, now, existing } = args;
        const record: AppRecord = {
            ...payload,
            key: makeAppKey(payload),
            registeredAt: existing?.registeredAt ?? now,
            updatedAt: now,
            lifecycle: existing?.lifecycle ?? 'running',
            status: existing?.status ?? 'offline',
            lastCheckedAt: existing?.lastCheckedAt ?? null,
            responseTimeMs: existing?.responseTimeMs ?? null,
            timedOut: existing?.timedOut ?? false,
            lastError: existing?.lastError ?? null,
        };
        if (record.lifecycle === 'deleted') record.lifecycle = 'running';
        return new App(record);
    }

    static placeholderForLifecycle(args: {
        name: string;
        host: string;
        port: number;
        lifecycle: Lifecycle;
        now: number;
    }): App {
        return new App({
            key: makeAppKey(args),
            name: args.name,
            port: args.port,
            host: args.host,
            icon: 'app',
            registeredAt: args.now,
            updatedAt: args.now,
            lifecycle: args.lifecycle,
            status: 'offline',
            lastCheckedAt: null,
            responseTimeMs: null,
            timedOut: true,
            lastError: `lifecycle:${args.lifecycle}`,
        });
    }

    get key(): string {
        return this.record.key;
    }

    get lifecycle(): Lifecycle {
        return this.record.lifecycle;
    }

    setLifecycle(lifecycle: Lifecycle, now: number): void {
        this.record.updatedAt = now;
        this.record.lifecycle = lifecycle;

        if (lifecycle !== 'running') {
            this.record.status = 'offline';
            this.record.responseTimeMs = null;
            this.record.timedOut = true;
            this.record.lastError = `lifecycle:${lifecycle}`;
        }
    }

    markStopped(now: number): void {
        this.record.status = 'offline';
        this.record.lastCheckedAt = this.record.lastCheckedAt ?? now;
    }

    applyProbeResult(result: ProbeResult, now: number): void {
        this.record.status = result.status;
        this.record.lastCheckedAt = now;
        this.record.responseTimeMs = result.responseTimeMs;
        this.record.timedOut = result.timedOut;
        this.record.lastError = result.lastError;
    }

    toRecord(): AppRecord {
        return { ...this.record };
    }
}
