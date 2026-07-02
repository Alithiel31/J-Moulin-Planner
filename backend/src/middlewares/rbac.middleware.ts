import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../lib/errors';

const roleHierarchy: Record<string, number> = {
  admin: 3,
  teamlead: 2,
  teammate: 1,
};

export const rbac = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};

export const hasMinimumRole = (minRole: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    const userHierarchy = roleHierarchy[req.user.role] || 0;
    const requiredHierarchy = roleHierarchy[minRole] || 0;

    if (userHierarchy < requiredHierarchy) {
      return next(new AuthorizationError('Insufficient permissions'));
    }

    next();
  };
};
