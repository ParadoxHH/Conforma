import { Router } from 'express';
import * as inviteController from '../controllers/invite.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/:token', inviteController.getInvite);
router.post('/', protect, inviteController.createInvite);
router.post('/:token/accept', inviteController.acceptInvite);

export default router;
