import { UnauthorizedError } from '#/utils/error.js';
import { Request, Response, NextFunction } from 'express';
import * as jwtService from '../utils/jwt.service.js';
import { AccessTokenPayload } from '#/auth/auth.payload.js';

export const aunthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError('Authentication errorr , Please login or register to continue');
    }
    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Authentication errorr , Please login or register to continue');
    }

    const verified = (await jwtService.verify(token)) as AccessTokenPayload;
    if (!verified) {
      throw new UnauthorizedError('Authentication errorr , Please login or register to continue');
    }

    req.user = {
      id: verified.id,
      role: verified.role,
      email: verified.email,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Authentication errorr , Please login or register to continue');
  }
};
