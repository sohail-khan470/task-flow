// src/routes/api.routes.ts (or wherever your apiRouter is located)
import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import { projectRouter } from '#/modules/projects/project.routes.js';
import { tasksRouter } from '#/modules/tasks/tasks.routes.js';
import { authRouter } from '#/modules/auth/auth.routes.js';

const apiRouter: Router = Router();

/**
 * Health Check Routes
 * Mounts: /api/v1/health
 */
apiRouter.use('/health', healthRoutes);

/**
 * auth routes
 * /api/auth
 */
apiRouter.use('/auth', authRouter);

/**
 * Project Routes
 * Mounts: /api/v1/projects
 */
apiRouter.use('/projects', projectRouter);

/**
 * Task Routes
 * Mounts: /api/v1/tasks or /api/v1/projects/:projectId/tasks
 * (Depending on how you configured the paths inside tasksRouter)
 */
apiRouter.use('/tasks', tasksRouter);

// Optional: Catch-all 404 for undefined API routes
apiRouter.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
});

export default apiRouter;
