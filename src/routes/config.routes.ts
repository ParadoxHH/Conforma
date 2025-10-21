import { Router } from 'express';
import { Role } from '@prisma/client';
import rbacGuard from '../guards/rbac.guard';
import { getStateConfiguration, updateStateConfiguration } from '../controllers/config.controller';

const router = Router();

router.get('/states', getStateConfiguration);
router.put('/states/:code', rbacGuard([Role.ADMIN]), updateStateConfiguration);

export default router;
