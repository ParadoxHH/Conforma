import { Router } from 'express';
import * as milestoneController from '../controllers/milestone.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.patch('/:id/status', milestoneController.updateMilestoneStatus);

export default router;
