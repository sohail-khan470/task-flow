// src/utils/asyncHandler.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Defines the signature for an async Express controller method.
 */
type AsyncControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;

/**
 * Wraps an async Express route handler to ensure that any rejected promises
 * (or synchronous errors thrown inside the async function) are caught and
 * passed to the Express global error handling middleware via next().
 *
 * @param fn - The async controller function to wrap.
 * @returns A standard Express RequestHandler.
 *
 * @example
 * router.get('/', asyncHandler(async (req, res) => {
 *   const data = await db.findMany(); // If this throws, it goes to the error handler
 *   res.json(data);
 * }));
 */
export const asyncHandler = (fn: AsyncControllerFunction): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Promise.resolve ensures that even if the function throws synchronously
    // before hitting an `await`, the error is still caught and passed to next().
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
