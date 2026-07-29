// src/modules/projects/project.routes.ts
import { Router } from 'express';

import { ProjectController } from './project.controller.js';

// FIX 1: Import your actual Express validation middleware, NOT the uuid validate function
// Adjust the path '#/middlewares/validate.js' to wherever your middleware is actually located

import {
  createProjectSchema,
  getProjectSchema,
  listProjectsSchema,
  updateProjectSchema,
} from './project.validation.js'; // FIX 2: Corrected file name from project.validation.js
import { validate } from '#/middlewares/validate.middleware.js';
import idempotencyMiddleware from '#/middlewares/idompotency.js';

const router: Router = Router();
const projectController = new ProjectController();

/**
 * GET /api/v1/projects
 * List all projects with pagination
 */
router.get('/', validate(listProjectsSchema), projectController.getAll); // FIX 3: Matched controller method name

/**
 * GET /api/v1/projects/:id
 * Get a single project by ID
 */
router.get('/:id', validate(getProjectSchema), projectController.getById); // FIX 3

/**
 * POST /api/v1/projects
 * Create a new project
 */
router.post('/', idempotencyMiddleware, validate(createProjectSchema), projectController.create); // FIX 3

/**
 * PATCH /api/v1/projects/:id
 * Partially update an existing project
 */
router.patch('/:id', validate(updateProjectSchema), projectController.update); // FIX 3 & 4: Fixed typo 'updateProjectSchemaa'

/**
 * DELETE /api/v1/projects/:id
 * Delete a project
 */
router.delete('/:id', validate(getProjectSchema), projectController.delete); // FIX 3

export default router;
