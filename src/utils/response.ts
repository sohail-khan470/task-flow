export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: {
    cursor?: string | null;
    hasMore?: boolean;
    total?: number; // only when cheap to compute (e.g., from a COUNT query)
  };
  error?: {
    code: string; // machine-readable: 'VALIDATION_ERROR', 'NOT_FOUND', etc.
    message: string; // human-readable
    details?: unknown; // field-level validation errors, stack trace in dev, etc.
  };
}

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
