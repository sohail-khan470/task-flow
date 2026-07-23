import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3202),
  DATABASE_URL: z.url(),
  REDIS_URL: z.url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate limiting
  RATE_LIMIT_GLOBAL_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().default(100),
  RATE_LIMIT_LOGIN_WINDOW_MS: z.coerce.number().default(900_000),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().default(5),
});

const parsedEnv = envSchema.safeParse(process.env);

// 3. Format and log error messages cleanly if validation fails
if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1); // Stop the app from booting
}

// 4. Export the typed data
export const env = parsedEnv.data;
