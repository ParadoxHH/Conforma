import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as evidenceController from '../controllers/evidence.controller';

const router = Router();

router.use(protect);

router.post('/upload-url', evidenceController.requestUploadUrl);
router.post('/', evidenceController.createEvidence);
router.get('/milestones/:milestoneId', evidenceController.listEvidence);

export default router;
