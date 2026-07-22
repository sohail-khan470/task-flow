import express from 'express';
import * as cors from 'cors';
import { securityMiddleware } from './middlewares/security.middleware.js';
import { env } from './config/server-config.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';
const app = express();

app.use(securityMiddleware);
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false }));

const server = app.listen(env.PORT, () => {
  logger.info(`Server is running on the port ${env.PORT}`);
});

async function gracefulShutdown() {
  logger.info('Shutdown signal received, closing gracefully...');

  // Stop accepting new connections and wait for existing requests
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }

      resolve();
    });
  });

  // Close Prisma connections
  await prisma.$disconnect();

  logger.info('Shutdown complete.');

  process.exit(0);
}

// Graceful shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled Promise Rejections
process.on('unhandledRejection', (reason) => {
  logger.fatal(reason, 'Unhandled Rejection');
  process.exit(1);
});

// Uncaught Exceptions
process.on('uncaughtException', (err) => {
  logger.fatal(err, 'Uncaught Exception');
  process.exit(1);
});
