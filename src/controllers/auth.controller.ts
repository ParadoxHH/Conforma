import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};