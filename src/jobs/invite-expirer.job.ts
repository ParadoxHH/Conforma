import cron from 'node-cron';
import * as inviteService from '../services/invite.service';
import { logger } from '../utils/logger';

export const startInviteExpiryJob = () => {
  cron.schedule('0 3 * * *', async () => {
    try {
      const expiredCount = await inviteService.expireStaleInvites();
      if (expiredCount > 0) {
        logger.info(`Invite expiry job: expired ${expiredCount} invites`);
      }
    } catch (error) {
      logger.error('Invite expiry job failed', error);
    }
  });
};
