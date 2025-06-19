import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { IUserPayload } from '../interfaces/IUserPayload';

// Custom interface untuk request
export interface AuthRequest extends Request {
  user?: IUserPayload;
}
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized - user not authenticated' });
      return;
    }

    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({ message: 'Forbidden - insufficient permissions' });
      return;
    }
    next();
  };
};
