import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { triageDispute, getDisputeTriage } from '../services/ai-triage.service';
import prisma from '../lib/prisma';

export const generateDisputeTriage = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Only admins can trigger AI triage.' });
  }

  try {
    const summary = await triageDispute(req.params.id, prisma);
    res.status(201).json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to triage dispute', error: error.message });
  }
};

export const getDisputeSummary = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const record = await getDisputeTriage(req.params.id, prisma);
    if (!record) {
      return res.status(404).json({ message: 'No AI summary found' });
    }
    res.status(200).json(record);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to fetch AI summary', error: error.message });
  }
};
