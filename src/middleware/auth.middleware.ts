import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization;

  if (!bearer || !bearer.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = bearer.split(' ')[1].trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};
