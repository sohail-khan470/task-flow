// src/modules/health/health.routes.ts
import { prisma } from '#/config/database.js';
import { logger } from '#/config/logger.js';
import { Router, Request, Response } from 'express';

const router: Router = Router();

/**
 * GET /health
 * Liveness probe.
 * Returns 200 immediately if the Node.js process is alive.
 * NO database checks here to prevent Kubernetes restart loops.
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /ready
 * Readiness probe.
 * Verifies that the database is reachable before accepting traffic.
 * Returns 200 if connected, 503 if disconnected.
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    // Lightweight query to verify DB connection
    // Prisma will attempt a lazy connection if it hasn't connected yet
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ok',
      database: 'connected',
    });
  } catch (error) {
    logger.debug(error);
    // If DB is unreachable, return 503 so the load balancer stops sending traffic
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
    });
  }
});

export default router;
