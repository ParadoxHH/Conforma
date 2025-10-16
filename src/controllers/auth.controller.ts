import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import prisma from '../lib/prisma';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body, prisma, argon2);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body, prisma, argon2, jwt);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const { id } = (req as Request & { user?: { id?: string } }).user ?? {};
    if (!id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { password, ...safeUser } = user;
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};
