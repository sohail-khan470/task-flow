import { z } from 'zod';
import { PaginationSchema } from '../../utils/pagination.js';

export const ListProjectsQuerySchema = PaginationSchema.extend({
  // Allows filtering projects by owner (e.g. for admins)
  ownerId: z.cuid2().optional(),

  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(2000).optional(),
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  description: z.string().max(2000).optional(),
});

export type ListProjectsQuery = z.infer<typeof ListProjectsQuerySchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
