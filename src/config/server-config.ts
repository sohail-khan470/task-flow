import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3202),
  DATABASE_URL: z.url(),
  REDISt_URL: z.url(),
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
