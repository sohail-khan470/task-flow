// src/utils/type-guards.ts
import { ZodError } from 'zod';
import { AppError } from './error.js';
import { Prisma } from '#/generated/prisma/client.js';
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

export function isPrismaKnownRequestError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaValidationError(
  error: unknown
): error is Prisma.PrismaClientValidationError {
  return error instanceof Prisma.PrismaClientValidationError;
}

// Helper to safely access AppError errors
export function getAppErrorErrors(error: AppError): any[] | undefined {
  return error.errors;
}

// Helper to safely access Prisma meta
export function getPrismaMeta(error: Prisma.PrismaClientKnownRequestError) {
  return (error as any).meta as Record<string, any> | undefined;
}
