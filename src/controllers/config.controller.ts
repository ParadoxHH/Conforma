import { Request, Response } from 'express';
import { appConfig } from '../config/app.config';
import { listStateRules } from '../config/state.config';

export const getStateConfiguration = (_req: Request, res: Response) => {
  const states = listStateRules(appConfig.allowedStates);
  res.status(200).json(states);
};
