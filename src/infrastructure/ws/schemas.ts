import { z } from 'zod';

export const AgentHelloSchema = z.object({
    type: z.literal('agent_hello'),
    agentId: z.string().min(1).max(200),
    host: z.string().min(1).max(255),
    userAgent: z.string().max(400).optional(),
});
