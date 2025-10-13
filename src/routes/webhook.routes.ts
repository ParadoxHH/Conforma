import { Router } from 'express';
import * as webhookController from '../controllers/webhook.controller';

const router = Router();

router.post('/escrow', webhookController.handleEscrowWebhook);

export default router;
