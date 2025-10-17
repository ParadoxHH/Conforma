import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getContractor, getHomeowner, getAdmin } from '../controllers/analytics.controller';

const router = Router();

router.use(protect);
router.get('/contractor', getContractor);
router.get('/homeowner', getHomeowner);
router.get('/admin', getAdmin);

export default router;
