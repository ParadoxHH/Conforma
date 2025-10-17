import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { getContractorAnalytics, getHomeownerAnalytics, getAdminAnalytics } from '../services/analytics.service';

const parseDate = (value?: string | string[]) => {
  if (!value || Array.isArray(value)) {
    return undefined;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp);
};

export const getContractor = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };
  if (!user?.id || user.role !== Role.CONTRACTOR) {
    return res.status(403).json({ message: 'Contractor access required.' });
  }

  const from = parseDate(req.query.from as string | undefined);
  const to = parseDate(req.query.to as string | undefined);

  try {
    const analytics = await getContractorAnalytics(
      user.id,
      { from, to },
      prisma,
    );
    res.status(200).json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to load contractor analytics', error: error.message });
  }
};

export const getHomeowner = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };
  if (!user?.id || user.role !== Role.HOMEOWNER) {
    return res.status(403).json({ message: 'Homeowner access required.' });
  }

  const from = parseDate(req.query.from as string | undefined);
  const to = parseDate(req.query.to as string | undefined);

  try {
    const analytics = await getHomeownerAnalytics(
      user.id,
      { from, to },
      prisma,
    );
    res.status(200).json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to load homeowner analytics', error: error.message });
  }
};

export const getAdmin = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };
  if (!user?.id || user.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const from = parseDate(req.query.from as string | undefined);
  const to = parseDate(req.query.to as string | undefined);

  try {
    const analytics = await getAdminAnalytics({ from, to }, prisma);
    res.status(200).json(analytics);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to load admin analytics', error: error.message });
  }
};
