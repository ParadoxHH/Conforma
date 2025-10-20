import cron from 'node-cron';
import { expireStaleDocuments } from '../services/document.service';
import { logger } from '../utils/logger';
import { recordCronRun } from '../lib/autonomyHealth';

export const startDocumentExpiryJob = () => {
  cron.schedule('15 2 * * *', async () => {
    try {
      const expiredCount = await expireStaleDocuments();
      if (expiredCount > 0) {
        logger.info(Document expiry job: marked  documents as expired);
      }
      recordCronRun('document_expiry', expired=);
    } catch (error) {
      logger.error('Document expiry job failed', error);
      recordCronRun('document_expiry', ailed: );
    }
  });
};

