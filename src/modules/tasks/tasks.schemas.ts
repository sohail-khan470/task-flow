// file: src/modules/tasks/task.schemas.ts
// Schema/config — write completely.

import { z } from 'zod';
import { PaginationSchema } from '../../utils/pagination.js';
import { TaskStatus, Priority } from '#/generated/prisma/enums.js';

export const ListTasksQuerySchema = PaginationSchema.extend({
  projectId: z.cuid2().optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(Priority).optional(),
  assigneeId: z.cuid2().optional(),

  sortBy: z.enum(['createdAt', 'dueDate', 'priority', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(500).trim(),
  description: z.string().max(5000).optional(),
  status: z.enum(TaskStatus).default('TODO'),
  priority: z.enum(Priority).default('MEDIUM'),

  // ✅ FIX: Use z.coerce.date() so Prisma receives a JS Date object, not a string
  dueDate: z.coerce.date().optional(),

  projectId: z.cuid2(),
  assigneeId: z.cuid2(),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).trim().optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(Priority).optional(),

  // ✅ FIX: Use z.coerce.date() with nullable and optional
  dueDate: z.coerce.date().nullable().optional(),

  assigneeId: z.cuid2().nullable().optional(),
});

export type ListTasksQuery = z.infer<typeof ListTasksQuerySchema>;
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
