import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getReferralProfile, redeemCode } from '../controllers/referral.controller';

const router = Router();

router.use(protect);
router.get('/me', getReferralProfile);
router.post('/redeem', redeemCode);

export default router;
