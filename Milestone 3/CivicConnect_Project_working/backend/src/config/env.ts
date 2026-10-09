import { z } from 'zod';

// The rules for our settings. Each setting has a type and a default value.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

// "Env" is the shape of our settings, worked out from the rules above.
export type Env = z.infer<typeof envSchema>;


export function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error('Invalid settings in .env: ' + result.error.message);
  }
  return result.data;
}