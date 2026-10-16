import { z } from 'zod';

/**
 * All configuration comes from environment variables and is validated at start-up,
 * so a missing or weak secret stops the server instead of failing later (Security constraint).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: z
    .string()
    .default('http://localhost:5173')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  SEED_DEMO_USERS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DEMO_PASSWORD: z.string().min(8).optional(),
  NOTIFICATION_DISPATCH_INTERVAL_MS: z.coerce.number().int().min(0).default(5000),
  /**
   * PostgreSQL connection, e.g. postgres://user:password@localhost:5432/civicconnect.
   * When it is empty the API falls back to the temporary in-memory store (data lost on restart).
   */
  DATABASE_URL: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || /^postgres(ql)?:\/\//.test(value), {
      message: 'DATABASE_URL must start with postgres:// or postgresql://',
    }),
  /** Hosted databases (Render, Neon, Supabase ...) usually need SSL; a local database does not. */
  DATABASE_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n- ${problems.join('\n- ')}`);
  }
  if (parsed.data.NODE_ENV === 'production' && parsed.data.SEED_DEMO_USERS) {
    throw new Error('SEED_DEMO_USERS must not be enabled in production');
  }
  return parsed.data;
}
