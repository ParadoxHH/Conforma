import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { generateDisputeTriage, getDisputeSummary } from '../controllers/ai.controller';

const router = Router();

router.use(protect);
router.post('/disputes/:id/triage', generateDisputeTriage);
router.get('/disputes/:id', getDisputeSummary);

export default router;
