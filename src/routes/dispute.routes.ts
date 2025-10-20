import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/:disputeId', disputeController.getDispute);
router.post('/milestones/:milestoneId', disputeController.createDispute);
router.patch('/:disputeId/resolve', disputeController.resolveDispute);

export default router;
