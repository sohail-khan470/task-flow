// src/modules/tasks/task.repository.ts
import { prisma } from '#/config/database.js';
import { Priority, Prisma, Role, TaskStatus } from '#/generated/prisma/client.js';
import { AppError } from '#/utils/error.js';
import { decodeCursor, encodeCursor } from '#/utils/pagination.js';

// ============================================================================
// RETURN TYPES
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

export type TaskWithAssigneeAndBasicProject = Prisma.TaskGetPayload<{
  include: {
    assignee: { select: { id: true; name: true; email: true } };
    project: { select: { id: true; name: true } };
  };
}>;

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
   * Find all tasks for a specific project with cursor pagination and optional filters
   */
  async findAllByProject({
    projectId,
    cursor,
    limit,
    where,
  }: {
    projectId: string;
    cursor: Record<string, unknown> | null;
    limit: number;
    where?: { status?: TaskStatus; priority?: Priority };
  }): Promise<{ data: TaskWithAssignee[]; hasMore: boolean }> {
    const finalWhere: Prisma.TaskWhereInput = {
      projectId,
      ...where,
    };

    try {
      const items = await prisma.task.findMany({
        where: finalWhere,
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor.id as string } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      const hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, -1) : items;

      return { data, hasMore };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('The pagination cursor is no longer valid.', 400);
      }
      throw error;
    }
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
   */
  private handleNotFoundError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new AppError('Task not found', 404);
    }
    throw error;
  }

  /**
   * Find all tasks with dynamic cursor-based pagination, filters, and role-based access
   */
  async findAll({
    filters,
    user,
    pagination,
  }: {
    filters: {
      status?: TaskStatus;
      priority?: Priority;
      projectId?: string;
      assigneeId?: string;
    };
    user: {
      id: string;
      role: Role;
    };
    pagination: {
      limit: number;
      cursor?: string | null;
      sortBy: string;
      sortOrder: 'asc' | 'desc';
    };
  }): Promise<{
    items: TaskWithAssigneeAndBasicProject[];
    nextCursor: string | null;
    hasMore: boolean;
  }> {
    // 1. Initialize Prisma where clause
    const where: Prisma.TaskWhereInput = {};

    // 2. Add dynamic filters
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    // 3. Add ownership filter if user is a MEMBER
    if (user.role === 'MEMBER') {
      where.OR = [{ project: { ownerId: user.id } }, { assigneeId: user.id }];
    }

    const { limit, cursor, sortBy, sortOrder } = pagination;

    // 4. Add cursor conditions if cursor is provided
    if (cursor) {
      let decodedCursor: { sortValue: string | Date; id: string };

      try {
        decodedCursor = decodeCursor(cursor) as { sortValue: string | Date; id: string };
      } catch {
        throw new AppError('The pagination cursor is malformed.', 400);
      }

      const { sortValue, id } = decodedCursor;

      const cursorCondition: Prisma.TaskWhereInput =
        sortOrder === 'asc'
          ? {
              OR: [
                { [sortBy]: { gt: sortValue } } as Prisma.TaskWhereInput,
                { AND: [{ [sortBy]: sortValue } as Prisma.TaskWhereInput, { id: { gt: id } }] },
              ],
            }
          : {
              OR: [
                { [sortBy]: { lt: sortValue } } as Prisma.TaskWhereInput,
                { AND: [{ [sortBy]: sortValue } as Prisma.TaskWhereInput, { id: { lt: id } }] },
              ],
            };

      // Merge cursor conditions safely
      if (where.OR) {
        where.AND = [cursorCondition];
      } else {
        Object.assign(where, cursorCondition);
      }
    }

    // 5. Set deterministic ordering
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [
      { [sortBy]: sortOrder } as Prisma.TaskOrderByWithRelationInput,
      { id: sortOrder },
    ];

    // 6. Take limit + 1
    const take = limit + 1;

    // 7. Execute the query
    const items = await prisma.task.findMany({
      where,
      orderBy,
      take,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // 8. Determine hasMore and build nextCursor
    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, -1) : items;

    let nextCursor: string | null = null;

    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      const lastSortValue = (lastItem as Record<string, unknown>)[sortBy];

      nextCursor = encodeCursor({
        sortValue: lastSortValue,
        id: lastItem?.id,
      });
    }

    // 9. Return expected output structure
    return {
      items: data,
      nextCursor,
      hasMore,
    };
  }
}
