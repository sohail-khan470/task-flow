// file: src/config/redis.ts

import { Redis } from 'ioredis';

import { logger } from './logger.js';
import { env } from './server-config.js';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number) {
    if (times > 5) return null; // stop retrying after 5 attempts
    return Math.min(times * 200, 2000); // exponential backoff, max 2s
  },
  enableReadyCheck: true,
  // enableReadyCheck: the client waits for Redis to confirm it is
  // ready to accept commands before emitting the 'ready' event.
  // Without this, commands sent during Redis startup might fail.
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('connect', () => {
  logger.info('Redis connected');
});
