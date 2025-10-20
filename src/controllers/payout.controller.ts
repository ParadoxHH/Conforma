import { Request, Response } from 'express';
import { PayoutStatus, Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { createInstantPayout, listPayouts } from '../services/payout.service';

export const triggerInstantPayout = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.CONTRACTOR) {
    return res.status(403).json({ message: 'Only contractors can request instant payouts.' });
  }

  try {
    const payout = await createInstantPayout(req.params.jobId, user.id, prisma);
    res.status(201).json(payout);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const listMyPayouts = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.CONTRACTOR) {
    return res.status(403).json({ message: 'Only contractors can view payouts.' });
  }

  const { status, from, to } = req.query;

  const filters = {
    status: status && typeof status === 'string' ? (status as PayoutStatus) : undefined,
    from: from ? new Date(String(from)) : undefined,
    to: to ? new Date(String(to)) : undefined,
  };

  try {
    const payouts = await listPayouts(user.id, user.role, filters, prisma);
    res.status(200).json(payouts);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
