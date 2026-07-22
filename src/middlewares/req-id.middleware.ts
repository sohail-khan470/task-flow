import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const reqIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headerName = 'X-Request-Id';
  const incommingId = req.headers[headerName];
  const requestId = typeof incommingId === 'string' ? incommingId : randomUUID();
  req.headers[headerName] = requestId;
  res.setHeader(headerName, requestId);
  next();
};
