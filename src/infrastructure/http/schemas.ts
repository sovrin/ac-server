import { z } from 'zod';

export const AppPayloadSchema = z.object({
    name: z.string().min(1).max(80),
    port: z.number().int().min(1).max(65535),
    icon: z.string().min(1).max(200),
    host: z.string().min(1).max(255),
});

export const LifecycleUpdateSchema = z.object({
    name: z.string().min(1),
    port: z.number().int().min(1).max(65535),
    host: z.string().min(1),
    lifecycle: z.enum(['running', 'stopped', 'deleted']),
});

export const DeleteAppQuerySchema = z.object({
    key: z.string().min(1),
});
