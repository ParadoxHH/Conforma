import { Request, Response } from 'express';
import { autonomyConfig } from '../config/autonomy';
import { getCronRuns } from '../lib/autonomyHealth';

export const getAutonomyHealth = (_req: Request, res: Response) => {
  return res.status(200).json({
    flags: autonomyConfig,
    cron: getCronRuns(),
    timestamp: new Date().toISOString(),
  });
};
