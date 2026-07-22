// src/modules/tasks/task.controller.ts
import { Request, Response } from 'express';

import { asyncHandler } from '#/middlewares/errorHandler.js';

import { TaskService } from './tasks.service.js';
import { Priority, TaskStatus } from '#/generated/prisma/enums.js';

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  /**
   * GET /api/v1/projects/:projectId/tasks
   * List all tasks for a project with pagination and filters
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const projectId = req.params.projectId as string;

    // Safely extract and coerce pagination/filter params
    // (Your Zod middleware guarantees these are valid if they exist)
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const status = req.query.status as TaskStatus | undefined;
    const priority = req.query.priority as Priority | undefined;

    const result = await this.taskService.getTasksByProject({
      projectId,
      page,
      limit,
      status,
      priority,
    });

    res.status(200).json({
      data: result.data,
      meta: result.meta,
      errors: null,
    });
  });

  /**
   * GET /api/v1/tasks/:id
   * Get a single task by ID
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const task = await this.taskService.getTaskById({ id });

    res.status(200).json({
      data: task,
      meta: null,
      errors: null,
    });
  });

  /**
   * POST /api/v1/projects/:projectId/tasks
   * Create a new task within a specific project
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    // Merge projectId from URL params into the payload
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

    res.status(201).json({
      data: task,
      meta: null,
      errors: null,
    });
  });

  /**
   * PATCH /api/v1/tasks/:id
   * Partially update an existing task
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { title, description, status, priority, dueDate, assigneeId } = req.body;

    const task = await this.taskService.updateTask({
      id,
      // Passing the exact fields allows undefined (ignore) and null (unassign) to pass through correctly
      data: { title, description, status, priority, dueDate, assigneeId },
    });

    res.status(200).json({
      data: task,
      meta: null,
      errors: null,
    });
  });

  /**
   * DELETE /api/v1/tasks/:id
   * Delete a task
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;

    await this.taskService.deleteTask({ id });

    res.status(204).send();
  });
}
