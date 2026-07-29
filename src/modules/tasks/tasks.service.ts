// src/modules/tasks/task.service.ts
import {
  TaskRepository,
  TaskUpdateFields,
  TaskWithAssignee,
  TaskWithAssigneeAndProject,
} from './tasks.repository.js';
import { ProjectRepository } from '../projects/project.repository.js';
import { UserRepository } from '../users/user.repository.js';
import { logger } from '#/config/logger.js';

import { Priority, TaskStatus } from '#/generated/prisma/client.js';
import { NotFoundError } from '#/utils/error.js';

export class TaskService {
  private taskRepo: TaskRepository;
  private projectRepo: ProjectRepository;
  private userRepo: UserRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.projectRepo = new ProjectRepository();
    this.userRepo = new UserRepository();
  }

  /**
   * Get all tasks for a specific project with pagination and filters
   */
  async getTasksByProject({
    projectId,
    page,
    limit,
    status,
    priority,
  }: {
    projectId: string;
    page: number;
    limit: number;
    status?: TaskStatus;
    priority?: Priority;
  }): Promise<{ data: TaskWithAssignee[]; meta: { total: number; hasMore: boolean } }> {
    // 1. Verify project exists
    const project = await this.projectRepo.findById({ id: projectId });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // 2. Build where filter (only include defined fields)
    const where: { status?: TaskStatus; priority?: Priority } = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // 3. Calculate skip
    const skip = (page - 1) * limit;

    // 4. Call repository
    const { data, total } = await this.taskRepo.findAllByProject({
      projectId,
      skip,
      take: limit,
      where,
    });

    // 5. Return with standardized pagination meta
    const hasMore = skip + limit < total;

    return {
      data,
      meta: {
        total,
        hasMore,
      },
    };
  }

  /**
   * Get a single task by ID
   */
  async getTaskById({ id }: { id: string }): Promise<TaskWithAssigneeAndProject> {
    const task = await this.taskRepo.findById({ id });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    return task;
  }

  /**
   * Create a new task
   */
  async createTask(input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
  }): Promise<TaskWithAssignee> {
    // 1. Verify project exists
    const project = await this.projectRepo.findById({ id: input.projectId });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // 2. Verify assignee exists (if provided)
    if (input.assigneeId) {
      const user = await this.userRepo.findById(input.assigneeId);
      if (!user) {
        throw new NotFoundError('Assignee user not found');
      }
    }

    // 3. Edge Case: Log warning for past due dates
    if (input.dueDate && input.dueDate < new Date()) {
      logger.warn(
        { title: input.title, dueDate: input.dueDate },
        'Task created with a past due date'
      );
    }

    // 4. Create and return
    return this.taskRepo.create(input);
  }

  /**
   * Update an existing task
   */
  async updateTask({
    id,
    data,
  }: {
    id: string;
    data: Partial<TaskUpdateFields>;
  }): Promise<TaskWithAssignee> {
    // 1. Verify task exists
    const existingTask = await this.taskRepo.findById({ id });
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // 2. Verify assignee exists if it's being changed to a specific user
    // Note: undefined means "don't change", null means "unassign"
    if (data.assigneeId !== undefined && data.assigneeId !== null) {
      // ✅ Standardized to object parameter
      const user = await this.userRepo.findById(data.assigneeId);
      if (!user) {
        throw new NotFoundError('Assignee user not found');
      }
    }

    // 3. Update and return
    // The repository will pass `null` to Prisma if data.assigneeId is null, correctly setting the DB column to NULL
    return this.taskRepo.update({ id, data });
  }

  /**
   * Delete a task
   */
  async deleteTask({ id }: { id: string }): Promise<void> {
    // 1. Verify exists
    const existingTask = await this.taskRepo.findById({ id });
    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    // 2. Delete
    await this.taskRepo.delete({ id });
  }
}
