import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.get('/', notificationController.listNotifications);
router.post('/read', notificationController.markNotificationsRead);
router.get('/unread-count', notificationController.getUnreadCount);

export default router;
