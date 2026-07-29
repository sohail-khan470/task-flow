// src/modules/projects/project.controller.ts
import { Request, Response, RequestHandler } from 'express';

import { asyncHandler } from '#/utils/asyncHandler.js';
import { ProjectService } from './project.service.js';
import { successResponse } from '#/utils/response.js';
import { PaginationSchema } from '#/utils/pagination.js';
import { UnauthorizedError } from '#/utils/error.js';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    // ✅ Validate and parse cursor & limit from query params
    const { cursor, limit } = PaginationSchema.parse(req.query);

    const result = await this.projectService.getAllProjects({ cursor, limit });

    return res.status(200).json(successResponse(result.data, result.meta));
  });

  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const project = await this.projectService.getProjectById({ id });

    return res.status(200).json(successResponse(project));
  });

  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;
    const ownerId = req.user?.id as string;

    if (!ownerId) {
      throw new UnauthorizedError('Authentication error. Please login or register to continue');
    }

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
