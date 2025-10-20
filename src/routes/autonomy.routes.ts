import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';
import { getAutonomyHealth } from '../controllers/autonomy.controller';

const router = Router();

router.use(protect, isAdmin);

router.get('/health', getAutonomyHealth);

export default router;
