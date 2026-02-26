import type { ContainerSnapshot } from '@contracts/container';

import { z } from 'zod';

export const PortBindingSchema = z.object({
    containerPort: z.number(),
    hostIp: z.string().optional(),
    hostPort: z.number().optional(),
    protocol: z.string(),
});

export const ContainerInfoSchema = z.object({
    createdAt: z.number(),
    finishedAt: z.string().optional(),
    healthStatus: z.string().optional(),
    id: z.string(),
    labels: z.record(z.string(), z.string()),
    name: z.string(),
    ports: z.array(PortBindingSchema),
    restartCount: z.number(),
    startedAt: z.string().optional(),
    state: z.string(),
    status: z.string(),
});

export type ContainerInfoDto = ContainerSnapshot;

export const AgentContainerEventSchema = z.object({
    container: ContainerInfoSchema,
    event: z.string(),
    timestamp: z.number(),
    type: z.literal('container_event'),
});

export const AgentFullStateSchema = z.object({
    containers: z.array(ContainerInfoSchema),
    timestamp: z.number(),
    type: z.literal('full_state'),
});

export const AgentMessageSchema = z.discriminatedUnion('type', [
    AgentContainerEventSchema,
    AgentFullStateSchema,
]);

export type AgentMessage = z.infer<typeof AgentMessageSchema>;

export const ClientContainerEventSchema = z.object({
    agentId: z.string(),
    container: ContainerInfoSchema,
    event: z.string(),
    timestamp: z.number(),
    type: z.literal('container_event'),
});

export const ClientFullStateSchema = z.object({
    agentId: z.string(),
    containers: z.array(ContainerInfoSchema),
    timestamp: z.number(),
    type: z.literal('full_state'),
});

export const ClientMessageSchema = z.discriminatedUnion('type', [
    ClientContainerEventSchema,
    ClientFullStateSchema,
]);

export type ClientMessage = z.infer<typeof ClientMessageSchema>;
