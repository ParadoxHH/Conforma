import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as messageController from '../controllers/message.controller';

const router = Router();

router.use(protect);

router.get('/:id/messages', messageController.listMessages);
router.post('/:id/messages', messageController.createMessage);
router.post('/:id/messages/read', messageController.markMessagesRead);

export default router;
