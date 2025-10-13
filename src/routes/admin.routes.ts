import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all routes in this file
router.use(protect, isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/jobs', adminController.getAllJobs);
router.get('/disputes', adminController.getAllDisputes);

export default router;
