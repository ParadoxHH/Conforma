import { Router } from 'express';
import { getMatches } from '../controllers/match.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);
router.get('/contractors', getMatches);

export default router;
