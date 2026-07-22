// src/modules/projects/project.schema.ts
import { z } from 'zod';

// Temporary: ownerId in body until auth is wired (Phase 2)
export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).trim(),
    description: z.string().max(500).optional(),
    ownerId: z.string().cuid(), // Temporary - will be removed in Phase 2
  }),
});

// PATCH schema - all fields are optional
export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
  body: z.object({
    name: z.string().min(1).max(100).trim().optional(),
    description: z.string().max(500).optional(),
  }),
});

export const getProjectSchema = z.object({
  params: z.object({
    id: z.string().cuid(),
  }),
});

export const listProjectsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

// Type exports
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type GetProjectInput = z.infer<typeof getProjectSchema>;
export type ListProjectsInput = z.infer<typeof listProjectsSchema>;
