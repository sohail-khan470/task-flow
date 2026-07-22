// src/utils/response.ts
import { Response } from 'express';

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T> {
  data: T | null;
  meta: Record<string, unknown> | null;
  errors: Array<{ message: string; field?: string }> | null;
}

/**
 * Helper to send a standardized success response.
 * Ensures `errors` is always null and `data` is populated.
 */
export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  meta?: Record<string, unknown> | null
): void => {
  const response: ApiResponse<T> = {
    data,
    meta: meta ?? null,
    errors: null,
  };

  res.status(statusCode).json(response);
};

/**
 * Helper to send a standardized error response.
 * Ensures `data` is always null and `errors` is populated as an array.
 */
export const sendError = (
  res: Response,
  statusCode: number,
  errors: { message: string; field?: string } | Array<{ message: string; field?: string }>,
  meta?: Record<string, unknown> | null
): void => {
  // Normalize single error object into an array for consistency
  const errorArray = Array.isArray(errors) ? errors : [errors];

  const response: ApiResponse<null> = {
    data: null,
    meta: meta ?? null,
    errors: errorArray,
  };

  res.status(statusCode).json(response);
};
