import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getPlans, subscribeToPlan, getMyBilling } from '../controllers/billing.controller';

const router = Router();

router.get('/plans', getPlans);
router.use(protect);
router.post('/subscribe', subscribeToPlan);
router.get('/me', getMyBilling);

export default router;
