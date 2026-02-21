import { z } from 'zod';

export const LifecycleUpdateSchema = z.object({
    name: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    host: z.string().min(1),
    lifecycle: z.enum(['running', 'stopped', 'deleted']),
});

export const AppPayloadSchema = z.object({
    name: z.string().min(1).max(80),
    port: z.number().int().min(1).max(65535),
    icon: z.string().min(1).max(200),
    host: z.string().min(1).max(255),
});

export const AgentHelloSchema = z.object({
    type: z.literal('agent_hello'),
    agentId: z.string().min(1).max(200),
    host: z.string().min(1).max(255),
    userAgent: z.string().max(400).optional(),
});

export type AppPayload = z.infer<typeof AppPayloadSchema>;
export type LifecycleUpdate = z.infer<typeof LifecycleUpdateSchema>;

export type Status = 'online' | 'offline';
export type Lifecycle = 'running' | 'stopped' | 'deleted';

export type AppRecord = AppPayload & {
    key: string;

    // registration
    registeredAt: number;
    updatedAt: number;

    lifecycle: Lifecycle;

    // liveliness
    status: Status;
    lastCheckedAt: number | null;
    responseTimeMs: number | null;
    timedOut: boolean;
    lastError: string | null;
};

export type AgentPresence = {
    agentId: string; // unique ID from agent (hostname/container id/etc.)
    host: string; // the docker host the agent represents (e.g. nas.local)
    connectedAt: number;
    userAgent?: string | null;
};
