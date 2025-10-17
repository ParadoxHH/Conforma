import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { ensureReferralCode, getReferralSummary, redeemReferralCode } from '../services/referral.service';

export const getReferralProfile = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    await ensureReferralCode(user.id, prisma);
    const summary = await getReferralSummary(user.id, prisma);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to load referral profile', error: error.message });
  }
};

export const redeemCode = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };
  if (!user?.id) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { code } = req.body ?? {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Referral code is required.' });
  }

  try {
    await redeemReferralCode(user.id, code, prisma);
    const summary = await getReferralSummary(user.id, prisma);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
