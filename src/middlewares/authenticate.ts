import { UnauthorizedError } from '#/utils/error.js';
import { Request, Response, NextFunction } from 'express';
import * as jwtService from '../utils/jwt.service.js';
import { AccessTokenPayload } from '#/modules/auth/auth.payload.js';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authentication error , Please login or register to continue');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Authentication error , Please login or register to continue');
    }

    const verified = (await jwtService.verify(token)) as AccessTokenPayload;
    if (!verified) {
      throw new UnauthorizedError('Authentication error , Please login or register to continue');
    }

    req.user = {
      id: verified.id,
      role: verified.role,
      email: verified.email,
    };
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Authentication error , Please login or register to continue'));
    }
  }
};
