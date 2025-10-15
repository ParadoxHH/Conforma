import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { HttpException } from '../exceptions/httpException';
import { RequestWithUser } from '../interfaces/auth.interface';

const rbacGuard = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as RequestWithUser).user;
      if (user && roles.includes(user.role)) {
        next();
      } else {
        next(new HttpException(403, 'Forbidden'));
      }
    } catch (error) {
      next(new HttpException(403, 'Forbidden'));
    }
  };
};

export default rbacGuard;
