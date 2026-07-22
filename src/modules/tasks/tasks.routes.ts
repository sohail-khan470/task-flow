// src/modules/tasks/task.routes.ts
import { Router } from 'express';

import { TaskController } from './tasks.controller.js';
import { validate } from '#/middlewares/validate.middleware.js';
import {
  createTaskSchema,
  getTaskSchema,
  listTasksSchema,
  updateTaskSchema,
} from './tasks.validation.js';

const taskController = new TaskController();

// ============================================================================
// ROUTER 1: Nested Routes
// Base URL in app.ts: /api/v1/projects/:projectId/tasks
// Used for operations that require the parent Project ID.
// ============================================================================
export const projectTasksRouter: Router = Router();

/**
 * GET /api/v1/projects/:projectId/tasks
 * List all tasks for a specific project
 */
projectTasksRouter.get('/', validate(listTasksSchema), taskController.getAll);

/**
 * POST /api/v1/projects/:projectId/tasks
 * Create a new task within a specific project
 */
projectTasksRouter.post('/', validate(createTaskSchema), taskController.create);

// ============================================================================
// ROUTER 2: Flat Routes
// Base URL in app.ts: /api/v1/tasks
// Used for operations that only require the Task's own ID.
// This avoids deeply nested URLs like /api/v1/projects/:pid/tasks/:tid
// ============================================================================
export const tasksRouter: Router = Router();

/**
 * GET /api/v1/tasks/:id
 * Get a single task by ID
 */
tasksRouter.get('/:id', validate(getTaskSchema), taskController.getById);

/**
 * PATCH /api/v1/tasks/:id
 * Partially update an existing task
 */
tasksRouter.patch('/:id', validate(updateTaskSchema), taskController.update);

/**
 * DELETE /api/v1/tasks/:id
 * Delete a task
 */
tasksRouter.delete('/:id', validate(getTaskSchema), taskController.delete);
