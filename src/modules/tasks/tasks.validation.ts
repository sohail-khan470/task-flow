// src/modules/tasks/task.validation.ts
import { TaskStatus, Priority } from '#/generated/prisma/enums.js';
import { z } from 'zod';

// ✅ FIX: Import enums directly from Prisma.
// (Use the direct path if your project setup requires it instead of '@prisma/client')

// OR: import { TaskStatus, Priority } from '#/generated/prisma/enums.js';

// ============================================================================
// VALIDATION SCHEMAS (Zod 4 Syntax)
// ============================================================================

export const createTaskSchema = z.object({
  params: z.object({
    projectId: z.cuid({ error: 'Invalid project ID format' }),
  }),
  body: z.object({
    title: z
      .string()
      .min(1, { error: 'Title is required' })
      .max(200, { error: 'Title must be 200 characters or less' })
      .trim(),
    description: z
      .string()
      .max(2000, { error: 'Description must be 2000 characters or less' })
      .optional(),
    // z.enum() now uses the Prisma-generated enum directly
    status: z.enum(TaskStatus).default(TaskStatus.TODO),
    priority: z.enum(Priority).default(Priority.MEDIUM),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.cuid({ error: 'Invalid assignee ID format' }).nullable().optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.cuid({ error: 'Invalid task ID format' }),
  }),
  body: z.object({
    title: z.string().min(1, { error: 'Title cannot be empty' }).max(200).trim().optional(),
    description: z.string().max(2000).optional(),
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(Priority).optional(),
    dueDate: z.coerce.date().optional(),
    assigneeId: z.cuid({ error: 'Invalid assignee ID format' }).nullable().optional(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.cuid({ error: 'Invalid task ID format' }),
  }),
});

export const listTasksSchema = z.object({
  params: z.object({
    projectId: z.cuid({ error: 'Invalid project ID format' }),
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    status: z.enum(TaskStatus).optional(),
    priority: z.enum(Priority).optional(),
  }),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type GetTaskInput = z.infer<typeof getTaskSchema>;
export type ListTasksInput = z.infer<typeof listTasksSchema>;
