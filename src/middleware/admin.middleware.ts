import { Request, Response, NextFunction } from 'express';

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const { role } = req.user;

  if (role !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  next();
};
