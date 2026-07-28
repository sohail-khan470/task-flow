import { PrismaClient } from '#/generated/prisma/client.js';
import { env } from './server-config.js';
import { logger } from './logger.js';

// Prisma 7 uses standard driver adapters
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// 1. Explicitly create the pg Pool
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  connectionTimeoutMillis: 5000, // Fail fast if DB is unreachable
  idleTimeoutMillis: 30000, // Close idle connections after 30s
});

// 2. CRITICAL for Prisma 7: Prevent app crashes when Postgres drops idle connections
pool.on('error', (err: Error) => {
  logger.error({ err }, 'Unexpected error on idle Postgres client');
});

// 3. Pass the configured pool instance to the Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Global caching for development (prevents memory leaks with tsx watch/nodemon)
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    adapter,
    log: ['warn', 'error'],
  });
} else {
  prisma =
    globalThis.__prisma ??
    new PrismaClient({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });

  globalThis.__prisma = prisma;
}

export { prisma, pool };
