import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import * as reviewController from '../controllers/review.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', protect, profileController.getMyProfile);
router.put('/me', protect, profileController.updateMyProfile);
router.get('/contractors/:id', profileController.getContractorProfile);
router.get('/contractors/:id/reviews', reviewController.listContractorReviews);

export default router;
