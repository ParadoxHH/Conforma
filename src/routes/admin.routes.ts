import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import * as documentController from '../controllers/document.controller';
import { protect } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/admin.middleware';

const router = Router();

// Protect all routes in this file
router.use(protect, isAdmin);

router.get('/users', adminController.getAllUsers);
router.get('/jobs', adminController.getAllJobs);
router.get('/disputes', adminController.getAllDisputes);
router.get('/documents', documentController.adminListDocuments);
router.post('/documents/:id/approve', documentController.adminApproveDocument);
router.post('/documents/:id/reject', documentController.adminRejectDocument);
router.post('/verify/kyc', documentController.adminOverrideKyc);

export default router;
