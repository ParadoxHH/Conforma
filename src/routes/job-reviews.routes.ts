import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as reviewController from '../controllers/review.controller';

const router = Router();

router.use(protect);

router.post('/:id/reviews', reviewController.createJobReview);

export default router;
