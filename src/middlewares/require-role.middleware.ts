import { Role } from '#/generated/prisma/enums.js';
import { ForbiddenError, UnauthorizedError } from '#/utils/error.js';
import { Request, Response, NextFunction } from 'express';

// Support multiple roles with OR logic
export const requireRoleMiddleware = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new UnauthorizedError('Authentication error. Please login or register to continue');
    }

    // Check if user has ANY of the required roles
    const hasRequiredRole = roles.some((role) => user.role?.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenError('You do not have permission to perform this action');
    }

    next();
  };
};

// Usage:
// router.get('/admin', requireRoleMiddleware(Role.ADMIN), adminHandler);
// router.get('/manage', requireRoleMiddleware(Role.ADMIN, Role.MODERATOR), manageHandler);
