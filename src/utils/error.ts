// src/utils/errors.ts

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: any[];

  constructor(message: string, statusCode: number, isOperational: boolean = true, errors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;

    // Set the prototype explicitly for proper instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Set the name of the error
    this.name = this.constructor.name;

    // Capture stack trace (excluding constructor from trace)
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errors?: any[]) {
    super(message, 404, true, errors);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errors?: any[]) {
    super(message, 400, true, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', errors?: any[]) {
    super(message, 401, true, errors);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', errors?: any[]) {
    super(message, 403, true, errors);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', errors?: any[]) {
    super(message, 409, true, errors);
  }
}

// Error handler helper to determine if error is operational
export const isOperationalError = (error: Error): boolean => {
  return error instanceof AppError && error.isOperational === true;
};

// Optional: Export all error classes as a single object
export const Errors = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  isOperationalError,
};
