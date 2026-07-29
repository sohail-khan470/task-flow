// src/utils/pagination.ts
import { z } from 'zod';
import { AppError } from './error.js';

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

export function encodeCursor(data: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

export function decodeCursor(cursor: string): Record<string, unknown> {
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
  } catch {
    // ✅ Fixed: Pass message and statusCode
    throw new AppError('The pagination cursor is malformed.', 400);
  }
}
