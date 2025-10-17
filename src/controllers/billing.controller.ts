import { Request, Response } from 'express';
import { Role, SubscriptionTier } from '@prisma/client';
import { listPlans, subscribe, getBillingSummary } from '../services/billing.service';
import prisma from '../lib/prisma';

export const getPlans = (_req: Request, res: Response) => {
  res.json(listPlans());
};

export const subscribeToPlan = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.CONTRACTOR) {
    return res.status(403).json({ message: 'Only contractors can subscribe to plans.' });
  }

  const { plan, paymentMethodId, successUrl, cancelUrl } = req.body ?? {};
  if (!plan || !['PRO', 'VERIFIED'].includes(plan)) {
    return res.status(400).json({ message: 'A valid plan (PRO or VERIFIED) is required.' });
  }

  try {
    const result = await subscribe(
      user.id,
      {
        plan: plan as SubscriptionTier.PRO | SubscriptionTier.VERIFIED,
        paymentMethodId,
        successUrl,
        cancelUrl,
      },
      prisma,
    );

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to start subscription', error: error.message });
  }
};

export const getMyBilling = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.CONTRACTOR) {
    return res.status(403).json({ message: 'Only contractors can view billing.' });
  }

  try {
    const summary = await getBillingSummary(user.id, prisma);
    res.status(200).json(summary);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to load billing summary', error: error.message });
  }
};
