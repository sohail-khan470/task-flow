// file: src/middleware/idempotency.ts
import { NextFunction, Request, Response } from 'express';
import crypto from 'crypto';
import { redis } from '#/config/redis.js';
import { prisma } from '#/config/database.js';
import { errorResponse } from '#/utils/response.js';
import { logger } from '#/config/logger.js';

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // 1. Extract header (opt-in)
  const idempotencyKey = req.headers['idempotency-key'] as string | undefined;

  if (!idempotencyKey) {
    return next();
  }

  // 2. Validate key
  if (
    typeof idempotencyKey !== 'string' ||
    idempotencyKey.length === 0 ||
    idempotencyKey.length > 256
  ) {
    return res
      .status(400)
      .json(
        errorResponse(
          'VALIDATION_ERROR',
          'Idempotency key must be a non-empty string up to 256 characters.'
        )
      );
  }

  // 3. Compute fingerprint and Redis key
  const requestBody = JSON.stringify(req.body || {});
  const userId = req.user?.id || 'anonymous'; // Fallback if route is somehow hit without auth
  const fingerprint = crypto.createHash('sha256').update(requestBody).digest('hex');
  const redisKey = `idempotency:${userId}:${idempotencyKey}`;

  try {
    // 4. Attempt to read the Redis key
    const value = await redis.get(redisKey);

    if (value === 'PROCESSING') {
      // Another request with this key is currently in flight
      return res
        .status(409)
        .json(
          errorResponse(
            'REQUEST_IN_PROGRESS',
            'A request with this idempotency key is currently being processed.'
          )
        );
    }

    if (value) {
      // This is a replay. Value should be a JSON object (the stored response)
      try {
        const parsed = JSON.parse(value);

        // Compare stored requestHash with current fingerprint
        if (parsed.requestHash !== fingerprint) {
          return res
            .status(422)
            .json(
              errorResponse(
                'IDEMPOTENCY_KEY_REUSE',
                'This idempotency key was used with a different request body.'
              )
            );
        }

        // Hashes match -> return cached response directly
        return res.status(parsed.statusCode).json(parsed.responseBody);
      } catch (parseError) {
        // If Redis data is corrupted, treat as new request
        logger.error('Failed to parse idempotency record from Redis');
      }
    }

    // 5. New Request: Set the processing lock
    // SET NX (set-if-not-exists) EX 60 (60-second TTL for the processing lock)
    const lockAcquired = await redis.set(redisKey, 'PROCESSING', 'EX', 60, 'NX');

    if (!lockAcquired) {
      // Race condition — another request just set it
      return res
        .status(409)
        .json(
          errorResponse(
            'REQUEST_IN_PROGRESS',
            'A request with this idempotency key is currently being processed.'
          )
        );
    }

    // 6. Capture the response by monkey-patching res.json
    const originalJson = res.json.bind(res);
    let responseCaptured = false; // Prevent duplicate DB/Redis writes if json() is called multiple times

    res.json = (body: any) => {
      if (!responseCaptured) {
        responseCaptured = true;

        const responseCache = JSON.stringify({
          statusCode: res.statusCode,
          responseBody: body,
          requestHash: fingerprint,
        });

        // Store in Redis with a 24-hour TTL (86400 seconds)
        redis.set(redisKey, responseCache, 'EX', 86400).catch((err: Error) => {
          logger.error('Failed to cache idempotent response in Redis');
        });

        // Optionally write to the IdempotencyRecord database table for audit
        // Made non-blocking so it doesn't delay the response to the client
        prisma.idempotencyRecord
          .create({
            data: {
              key: idempotencyKey,
              userId: userId,
              method: req.method,
              path: req.path,
              requestHash: fingerprint,
              statusCode: res.statusCode,
              responseBody: body,
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            },
          })
          .catch((err: Error) => {
            logger.error('Failed to write idempotency record to database');
          });
      }

      // Call the original res.json so Express actually sends the response to the client
      return originalJson(body);
    };

    // 7. Proceed to the controller
    next();
  } catch (error) {
    // If Redis goes down, fail open (let the request proceed)
    logger.error('Idempotency middleware error, failing open');
    next();
  }
};

export default idempotencyMiddleware;
