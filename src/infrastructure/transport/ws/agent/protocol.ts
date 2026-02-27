import { ContainerSchema } from '@infra/transport/ws/protocol';
import { z } from 'zod';

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
