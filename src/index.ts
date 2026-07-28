import 'dotenv/config';
import type { Server } from 'http';
import { app } from './app.js';
import { env } from './config/server-config.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';

// import { redisClient } from './config/redis.js'; // Future import
// import { worker } from './queues/worker.js';    // Future import

let server: Server;
const SHUTDOWN_TIMEOUT = 10000; // 10 seconds force timeout

/**
 * Bootstraps the application by initializing connections and starting the server
 */
async function bootstrap(): Promise<void> {
  try {
    // 1. Initialize critical services (Database, Redis, Queues, etc.)
    await prisma.$connect();
    logger.info(' Prisma Database connected.');

    // await redisClient.connect();
    // logger.info('Redis connected.');

    // await worker.start();
    // logger.info(' Queue worker started.');

    // 2. Start HTTP Server
    server = app.listen(env.PORT, () => {
      logger.info(` Server is running on port ${env.PORT}`);
    });

    // Handle server errors (e.g. port already in use)
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${env.PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${env.PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    logger.fatal({ error }, '❌ Failed to bootstrap application');
    process.exit(1);
  }
}

/**
 * Gracefully shuts down services in reverse order of initialization
 */
async function gracefulShutdown(signal: string): Promise<void> {
  logger.info(` ${signal} received. Closing gracefully...`);

  // Force exit if shutdown takes too long (e.g., hanging connections)
  const forceExitTimer = setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT);

  try {
    // 1. Stop HTTP Server (Stop accepting new requests)
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error({ err }, 'Error closing HTTP server');
            reject(err);
            return;
          }
          logger.info(' HTTP server closed.');
          resolve();
        });
      });
    }

    // 2. Stop Queue Workers (Wait for current jobs to finish)
    // await worker.close();
    // logger.info('Queue workers stopped.');

    // 3. Close Redis Connection
    // await redisClient.quit();
    // logger.info(' Redis connection closed.');

    // 4. Close Database Connection
    await prisma.$disconnect();
    logger.info(' Prisma database disconnected.');

    logger.info(' Shutdown complete. Exiting.');
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    clearTimeout(forceExitTimer);
    process.exit(1);
  }
}

// Start the application
void bootstrap();

// --- Process Event Listeners ---

// Graceful shutdown signals
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Unhandled Promise Rejections (Attempt graceful shutdown, then crash)
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled Rejection');
  void gracefulShutdown('unhandledRejection');
});

// Uncaught Exceptions (Attempt graceful shutdown, then crash)
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error }, 'Uncaught Exception');
  void gracefulShutdown('uncaughtException');
});
