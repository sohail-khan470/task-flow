// src/modules/tasks/task.repository.ts

import { prisma } from '#/config/database.js';
import { Priority, Prisma, TaskStatus } from '#/generated/prisma/client.js';
// Adjust these imports based on your actual project structure

// ============================================================================
// RETURN TYPES
// Using Prisma's GetPayload to accurately type the returned objects
// based on the specific `include` and `select` clauses used in queries.
// ============================================================================

export type TaskWithAssignee = Prisma.TaskGetPayload<{
  include: { assignee: { select: { id: true; name: true; email: true } } };
}>;

export type TaskWithAssigneeAndProject = Prisma.TaskGetPayload<{
  include: {
    assignee: { select: { id: true; name: true; email: true } };
    project: { select: { id: true; name: true; ownerId: true } };
  };
}>;

// Define the allowed fields for updating to prevent accidental mutations of immutable fields
export type TaskUpdateFields = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: Date | null;
  assigneeId?: string | null;
};

// ============================================================================
// REPOSITORY CLASS
// ============================================================================

export class TaskRepository {
  /**
   * Find all tasks for a specific project with pagination and optional filters
   */
  async findAllByProject({
    projectId,
    skip,
    take,
    where,
  }: {
    projectId: string;
    skip: number;
    take: number;
    where?: { status?: TaskStatus; priority?: Priority };
  }): Promise<{ data: TaskWithAssignee[]; total: number }> {
    const finalWhere = {
      projectId,
      ...where,
    };

    // Run both queries in parallel for better performance
    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where: finalWhere,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.task.count({ where: finalWhere }),
    ]);

    return { data, total };
  }

  /**
   * Find a single task by ID, including assignee and project details
   */
  async findById({ id }: { id: string }): Promise<TaskWithAssigneeAndProject | null> {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true, ownerId: true },
        },
      },
    });
  }

  /**
   * Create a new task
   */
  async create(input: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: Priority;
    dueDate?: Date;
    projectId: string;
    assigneeId?: string;
  }): Promise<TaskWithAssignee> {
    return prisma.task.create({
      data: input,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  /**
   * Update an existing task
   */
  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<TaskUpdateFields>;
  }): Promise<TaskWithAssignee> {
    try {
      return await prisma.task.update({
        where: { id },
        data,
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    } catch (error) {
      this.handleNotFoundError(error);
    }
  }

  /**
   * Delete a task
   */
  async delete({ id }: { id: string }): Promise<void> {
    try {
      await prisma.task.delete({
        where: { id },
      });
    } catch (error) {
      this.handleNotFoundError(error);
    }
  }

  /**
   * Helper to handle Prisma P2025 (Record not found) errors.
   * Throws a 404 error that can be caught by your global error handler.
   */
  private handleNotFoundError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      const err = new Error('Task not found');
      (err as any).statusCode = 404;
      throw err;
    }
    // Re-throw if it's a different kind of error
    throw error;
  }
}
