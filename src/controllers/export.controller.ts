import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import prisma from '../lib/prisma';
import { generateAccountingCsv } from '../services/export.service';

const parseDate = (value?: string | string[]) => {
  if (!value || Array.isArray(value)) {
    return undefined;
  }
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp);
};

export const getAccountingCsv = async (req: Request, res: Response) => {
  const { user } = req as Request & { user?: { id?: string; role?: Role } };

  if (!user?.id || user.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const from = parseDate(req.query.from as string | undefined);
  const to = parseDate(req.query.to as string | undefined);

  try {
    const csv = await generateAccountingCsv({ from, to }, prisma);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="accounting-export.csv"');
    res.status(200).send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to generate CSV export', error: error.message });
  }
};
