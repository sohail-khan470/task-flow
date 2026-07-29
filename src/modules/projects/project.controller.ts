// src/modules/projects/project.controller.ts
import { Request, Response, RequestHandler } from 'express';

import { asyncHandler } from '#/utils/asyncHandler.js';
import { ProjectService } from './project.service.js';
import { successResponse } from '#/utils/response.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));

    const result = await this.projectService.getAllProjects({ page, limit });

    // Use successResponse, passing the data and meta
    return res.status(200).json(successResponse(result.data, result.meta));
  });

  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const project = await this.projectService.getProjectById({ id });

    return res.status(200).json(successResponse(project));
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name, description, ownerId } = req.body;

    const project = await this.projectService.createProject({
      name,
      description,
      ownerId,
    });

    return res.status(201).json(successResponse(project));
  });

  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { name, description } = req.body;

    const project = await this.projectService.updateProject({
      id,
      data: { name, description },
    });

    return res.status(200).json(successResponse(project));
  });

  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.projectService.deleteProject({ id });

    // 204 No Content is standard for deletions, so no body is sent.
    // If you prefer to send a JSON response, you could do:
    // return res.status(200).json(successResponse({ id }));
    return res.status(204).send();
  });
}
