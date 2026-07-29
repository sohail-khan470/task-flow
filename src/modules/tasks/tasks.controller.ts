// src/modules/tasks/task.controller.ts
import { Request, Response, RequestHandler } from 'express';
import { asyncHandler } from '#/middlewares/errorHandler.js'; // Adjust path if needed
import { TaskService } from './tasks.service.js';
import { successResponse } from '#/utils/response.js';
import { Priority, TaskStatus } from '#/generated/prisma/enums.js';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * GET /api/v1/projects/:projectId/tasks
   * List all tasks for a project with cursor-based pagination and filters
   */
  getAll: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;

    // Extract cursor-based pagination and filters from query params
    // (Your Zod middleware guarantees these are valid if they exist)
    const cursor = req.query.cursor as string | undefined;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as TaskStatus | undefined;
    const priority = req.query.priority as Priority | undefined;

    const result = await this.taskService.getTasksByProject({
      projectId,
      cursor,
      limit,
      status,
      priority,
    });

    return res.status(200).json(successResponse(result.data, result.meta));
  });

  /**
   * GET /api/v1/tasks/:id
   * Get a single task by ID
   */
  getById: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const task = await this.taskService.getTaskById({ id });

    return res.status(200).json(successResponse(task));
  });

  /**
   * POST /api/v1/projects/:projectId/tasks
   * Create a new task within a specific project
   */
  create: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await this.taskService.createTask({
      projectId,
      title,
      description,
      status,
      priority,
      dueDate,
      assigneeId,
    });

    return res.status(201).json(successResponse(task));
  });

  /**
   * PATCH /api/v1/tasks/:id
   * Partially update an existing task
   */
  update: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await this.taskService.updateTask({
      id,
      // Passing the exact fields allows undefined (ignore) and null (unassign) to pass through correctly
      data: { title, description, status, priority, dueDate, assigneeId },
    });

    return res.status(200).json(successResponse(task));
  });

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task
   */
  delete: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    await this.taskService.deleteTask({ id });

    return res.status(204).send();
  });
}
