import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as documentController from '../controllers/document.controller';

const router = Router();

router.use(protect);

router.post('/upload-url', documentController.requestUploadUrl);
router.post('/', documentController.createDocument);
router.get('/', documentController.listMyDocuments);

export default router;
