// src/middleware/errorHandler.ts - Alternative with type assertions
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '#/config/logger.js';
import { Prisma } from '#/generated/prisma/client.js';
import { AppError, ConflictError, NotFoundError, ValidationError } from '#/utils/error.js';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Default values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Array<{ message: string; field?: string }> = [];
  let stack: string | undefined;

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation failed';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
  }
  // Handle our custom AppError
  else if (err instanceof AppError) {
    // Use type assertion to access AppError properties
    const appError = err as AppError;
    statusCode = appError.statusCode;
    message = appError.message;

    if (appError.errors && Array.isArray(appError.errors)) {
      errors = appError.errors.map((e: any) => ({
        field: e.field || e.path?.join('.') || undefined,
        message: e.message || e,
      }));
    }
  }
  // Handle Prisma known request errors
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = err as Prisma.PrismaClientKnownRequestError & {
      meta?: Record<string, any>;
    };

    switch (prismaError.code) {
      case 'P2002': {
        const fields = (prismaError.meta?.target as string[]) || ['field'];
        const fieldNames = fields.join(', ');
        const conflictErr = new ConflictError(
          `Unique constraint violation on field: ${fieldNames}`
        );
        statusCode = conflictErr.statusCode;
        message = conflictErr.message;
        errors = fields.map((field) => ({
          field,
          message: `The ${field} must be unique`,
        }));
        break;
      }
      case 'P2025': {
        const notFoundErr = new NotFoundError('Record not found');
        statusCode = notFoundErr.statusCode;
        message = notFoundErr.message;
        break;
      }
      case 'P2003': {
        const validationErr = new ValidationError('Related record not found');
        statusCode = validationErr.statusCode;
        message = validationErr.message;
        if (prismaError.meta?.field_name) {
          errors = [
            {
              field: prismaError.meta.field_name as string,
              message: 'Related record not found',
            },
          ];
        }
        break;
      }
      default: {
        logger.error({ err, prismaCode: prismaError.code }, 'Unknown Prisma error');
        statusCode = 500;
        message = 'Internal Server Error';
        break;
      }
    }
  }
  // Handle Prisma validation errors
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
    errors = [{ message: err.message }];
  }
  // Handle Prisma initialization errors
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 500;
    message = 'Database connection error';
    logger.error({ err }, 'Prisma initialization failed');
  }
  // Handle any other error
  else {
    logger.error(
      {
        err,
        message: err.message,
        stack: err.stack,
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        params: req.params,
      },
      'Unhandled error occurred'
    );

    if (process.env.NODE_ENV === 'development') {
      message = err.message || 'Internal Server Error';
      stack = err.stack;
    } else {
      message = 'Internal Server Error';
    }
  }

  const response: {
    data: null;
    meta: null;
    errors: Array<{ message: string; field?: string }>;
    stack?: string;
  } = {
    data: null,
    meta: null,
    errors: errors.length > 0 ? errors : [{ message }],
  };

  if (process.env.NODE_ENV === 'development' && stack) {
    response.stack = stack;
  }

  if (statusCode >= 500) {
    logger.error({ err, statusCode, message }, 'Server error occurred');
  } else if (statusCode >= 400) {
    logger.warn({ err, statusCode, message, errors }, 'Client error occurred');
  }

  res.status(statusCode).json(response);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
