import { z } from 'zod';

const PortBindingSchema = z.object({
    containerPort: z.number(),
    hostIp: z.string().optional(),
    hostPort: z.number().optional(),
    protocol: z.string(),
});

const ContainerSchema = z.object({
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

const AgentContainerEventSchema = z
    .object({
        container: ContainerSchema,
        event: z.string(),
        timestamp: z.number(),
        type: z.literal('container_event'),
    })
    .strict();

const AgentFullStateSchema = z
    .object({
        containers: z.array(ContainerSchema),
        timestamp: z.number(),
        type: z.literal('full_state'),
    })
    .strict();

export const AgentMessageSchema = z.discriminatedUnion('type', [
    AgentContainerEventSchema,
    AgentFullStateSchema,
]);

export type TransportAgentMessage = z.infer<typeof AgentMessageSchema>;

const ClientContainerEventSchema = z
    .object({
        agentId: z.string(),
        container: ContainerSchema,
        event: z.string(),
        timestamp: z.number(),
        type: z.literal('container_event'),
    })
    .strict();

const ClientFullStateSchema = z
    .object({
        agentId: z.string(),
        containers: z.array(ContainerSchema),
        timestamp: z.number(),
        type: z.literal('full_state'),
    })
    .strict();

export const ClientMessageSchema = z.discriminatedUnion('type', [
    ClientContainerEventSchema,
    ClientFullStateSchema,
]);

export type TransportClientMessage = z.infer<typeof ClientMessageSchema>;
