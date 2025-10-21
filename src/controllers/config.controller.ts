import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { appConfig } from '../config/app.config';
import { listStateRules, upsertStateRule } from '../services/stateRule.service';

const stateRuleSchema = z.object({
  name: z.string().min(2),
  reviewWindowMidDays: z.number().int().positive(),
  reviewWindowFinalDays: z.number().int().positive(),
  platformFeeBps: z.number().int().min(0),
  kycRequired: z.boolean(),
});

export const getStateConfiguration = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const states = await listStateRules(appConfig.allowedStates);
    res.status(200).json(states);
  } catch (error) {
    next(error);
  }
};

export const updateStateConfiguration = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.params;

  try {
    const payload = stateRuleSchema.parse(req.body);
    const rule = await upsertStateRule(code, payload);
    res.status(200).json(rule);
  } catch (error) {
    next(error);
  }
};
