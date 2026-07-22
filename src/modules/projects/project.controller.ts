// src/modules/projects/project.controller.ts
import { Request, Response, NextFunction } from 'express';

import { asyncHandler } from '#/middlewares/errorHandler.js';
import { ProjectService } from './project.service.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * GET /api/v1/projects
   * List all projects with pagination
   */
  getAll = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const result = await this.projectService.getAllProjects({ page, limit });

    res.status(200).json({
      data: result.data,
      meta: result.meta,
      errors: null,
    });
  });

  /**
   * GET /api/v1/projects/:id
   * Get a single project by ID
   */
  getById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = this.validateId(req.params.id);

    const project = await this.projectService.getProjectById({ id });

    res.status(200).json({
      data: project,
      meta: null,
      errors: null,
    });
  });

  /**
   * POST /api/v1/projects
   * Create a new project
   */
  create = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { name, description, ownerId } = req.body;

    const project = await this.projectService.createProject({
      name,
      description,
      ownerId,
    });

    res.status(201).json({
      data: project,
      meta: null,
      errors: null,
    });
  });

  /**
   * PATCH /api/v1/projects/:id
   * Partially update an existing project
   */
  update = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = this.validateId(req.params.id);
    const { name, description } = req.body;

    const project = await this.projectService.updateProject({
      id,
      data: { name, description },
    });

    res.status(200).json({
      data: project,
      meta: null,
      errors: null,
    });
  });

  /**
   * DELETE /api/v1/projects/:id
   * Delete a project
   */
  delete = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const id = this.validateId(req.params.id);

    await this.projectService.deleteProject({ id });

    res.status(204).send();
  });

  /**
   * Validates and narrows an Express param to a strict string.
   * Throws 400 if missing or malformed.
   */
  private validateId(raw: string | string[] | undefined): string {
    if (raw === undefined || Array.isArray(raw)) {
      const error = new Error('Invalid project ID');
      (error as any).statusCode = 400;
      throw error;
    }
    return raw;
  }
}
