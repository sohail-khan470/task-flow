// src/modules/projects/project.controller.ts
import { Request, Response, NextFunction, RequestHandler } from 'express'; // ✅ Added RequestHandler

import { asyncHandler } from '#/utils/asyncHandler.js';
import { ProjectService } from './project.service.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const result = await this.projectService.getAllProjects({ page, limit });

    res.status(200).json({
      data: result.data,
      meta: result.meta,
      errors: null,
    });
  });

  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string; // Added 'as string' for consistency
    const project = await this.projectService.getProjectById({ id });

    res.status(200).json({
      data: project,
      meta: null,
      errors: null,
    });
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
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

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
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

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.projectService.deleteProject({ id });
    res.status(204).send();
  });
}
