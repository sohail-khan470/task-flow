import { PrismaClient } from '#/generated/prisma/client.js';
import { env } from './server-config.js';

import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

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

export { prisma };
