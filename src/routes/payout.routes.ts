import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { triggerInstantPayout, listMyPayouts, getJobFeeBreakdown } from '../controllers/payout.controller';

const router = Router({ mergeParams: true });

router.use(protect);

router.get('/me', listMyPayouts);
router.post('/:jobId/instant', triggerInstantPayout);

export default router;
