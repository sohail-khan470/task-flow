import pino from 'pino';
import { env } from './server-config.js'; // Uses your validated env schema

const isDevelopment = env.NODE_ENV === 'development';

export const logger = pino({
  // 1. Set level dynamically based on environment
  level: isDevelopment ? 'debug' : 'info',

  // 2. Configure target transport options
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined, // Defaults to fast, structured JSON in production

  // 3. Block sensitive security tokens from leaking into logs
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});
