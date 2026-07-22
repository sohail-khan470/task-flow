import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

// Define the shape we expect the schema to output
interface RequestSchemaOutput {
  body?: any;
  query?: any;
  params?: any;
}

/**
 * Generic Zod validation middleware factory.
 * Validates req.body, req.query, and/or req.params against a Zod schema.
 *
 * @param schema A Zod schema that parses to an object with optional keys body, query, params.
 * @returns Express middleware function.
 */
export const validate = (schema: z.ZodType<RequestSchemaOutput>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Parse the incoming request properties against the schema
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign the parsed (and potentially transformed/coerced) values back to req
      // We use 'in' operator to only overwrite if the key was defined in the schema
      if ('body' in parsed) req.body = parsed.body;
      if ('query' in parsed) req.query = parsed.query as any; // Cast to any to bypass Express strict query types
      if ('params' in parsed) req.params = parsed.params;

      // Proceed to the next middleware/route handler
      next();
    } catch (error) {
      // Pass the ZodError to Express's error handling middleware
      next(error);
    }
  };
};
