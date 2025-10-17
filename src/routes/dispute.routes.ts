import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);\n\nrouter.get('/:disputeId', disputeController.getDispute);

// A homeowner creates a dispute against a milestone
router.post('/milestones/:milestoneId', disputeController.createDispute);

// An admin resolves a dispute
router.patch('/:disputeId/resolve', disputeController.resolveDispute);

export default router;

