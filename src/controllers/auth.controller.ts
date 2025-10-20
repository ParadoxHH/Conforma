import { Request, Response } from 'express';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { z } from 'zod';
import * as authService from '../services/auth.service';
import { notify } from '../lib/email/notifier';
import prisma from '../lib/prisma';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['HOMEOWNER', 'CONTRACTOR']),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const register = async (req: Request, res: Response) => {
  try {
    const payload = registerSchema.parse(req.body);
    const user = await authService.register(payload, prisma, argon2);
    const event = user.role === 'CONTRACTOR' ? 'user_registered_contractor' : 'user_registered_homeowner';
    notify(event, { to: user.email, name: user.email.split('@')[0] }).catch((error) => {
      console.error('Failed to send registration email', error);
    });
    res.status(201).json(user);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }

    if (error?.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use' });
    }

    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const credentials = loginSchema.parse(req.body);
    const { user, token } = await authService.login(credentials, prisma, argon2, jwt);
    res.status(200).json({ user, token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
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


