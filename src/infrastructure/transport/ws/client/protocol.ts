import { ContainerSchema } from '@infra/transport/ws/protocol';
import { z } from 'zod';

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
