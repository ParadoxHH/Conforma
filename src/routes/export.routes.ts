import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import { getAccountingCsv } from '../controllers/export.controller';

const router = Router();

router.use(protect);
router.get('/accounting.csv', getAccountingCsv);

export default router;
