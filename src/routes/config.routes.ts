import { Router } from 'express';
import { getStateConfiguration } from '../controllers/config.controller';

const router = Router();

router.get('/states', getStateConfiguration);

export default router;
