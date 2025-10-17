import { Request, Response } from 'express';
import { findBestContractorMatches } from '../services/matching.service';

export const getMatches = async (req: Request, res: Response) => {
  const { trade, zip, radius, limit, budget } = req.query;

  try {
    const matches = await findBestContractorMatches({
      trade: typeof trade === 'string' ? trade : undefined,
      zip: typeof zip === 'string' ? zip : undefined,
      radius: radius ? Number(radius) : undefined,
      limit: limit ? Number(limit) : undefined,
      budget: budget ? Number(budget) : undefined,
    });

    res.status(200).json(matches);
  } catch (error: any) {
    res.status(500).json({ message: 'Unable to generate contractor matches', error: error.message });
  }
};
