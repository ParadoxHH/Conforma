import { Request, Response } from 'express';
import { z } from 'zod';
import * as riskService from '../services/risk.service';

const updateConfigSchema = z.object({
  allowThreshold: z.number().int().min(0).max(100).optional(),
  blockThreshold: z.number().int().min(0).max(100).optional(),
  maxJobAmountByTrade: z
    .record(z.string().min(2).max(40), z.number().nonnegative())
    .optional(),
}).refine(
  (data) =>
    data.allowThreshold === undefined ||
    data.blockThreshold === undefined ||
    (typeof data.allowThreshold === 'number' && typeof data.blockThreshold === 'number'
      ? data.allowThreshold <= data.blockThreshold
      : true),
  {
    message: 'allowThreshold must be less than or equal to blockThreshold',
    path: ['allowThreshold'],
  },
);

export const getJobRisk = async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;
    const event = await riskService.getLatestRiskEvent(jobId);
    if (!event) {
      return res.status(404).json({ message: 'No risk events found for this job.' });
    }
    return res.status(200).json({ event });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load risk event', error: error.message });
  }
};

export const getRiskConfig = async (_req: Request, res: Response) => {
  try {
    const config = await riskService.getRiskConfig();
    return res.status(200).json({ config });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load risk config', error: error.message });
  }
};

export const updateRiskConfig = async (req: Request, res: Response) => {
  try {
    const parsed = updateConfigSchema.parse(req.body);
    const config = await riskService.updateRiskConfig(parsed);
    return res.status(200).json({ message: 'Risk configuration updated', config });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    return res.status(500).json({ message: 'Failed to update risk config', error: error.message });
  }
};
