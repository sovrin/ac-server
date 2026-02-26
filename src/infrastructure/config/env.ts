import { z } from 'zod';

const PORT = 3000;

const EnvSchema = z.object({
    PORT: z.coerce.number().default(PORT),
});

export const env = EnvSchema.parse(process.env);
