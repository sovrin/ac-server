import { z } from 'zod';

export const PortBindingSchema = z.object({
    containerPort: z.number(),
    hostIp: z.string().optional(),
    hostPort: z.number().optional(),
    protocol: z.string(),
});

export const ContainerSchema = z.object({
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
