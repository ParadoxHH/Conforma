import cron from 'node-cron';
import { logger } from '../utils/logger';
import { getContractorsForIndex } from '../services/search.service';
import { recordCronRun } from '../lib/autonomyHealth';

export const startContractorSearchSyncJob = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      const contractors = await getContractorsForIndex();
      logger.info(Contractor search sync: prepared  records);
      recordCronRun('search_sync', count=);
      // TODO: push to external search index (e.g., Algolia) when credentials are configured.
    } catch (error) {
      logger.error('Contractor search sync failed', error);
      recordCronRun('search_sync', ailed: );
    }
  });
};

