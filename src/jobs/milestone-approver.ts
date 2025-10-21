import cron from 'node-cron';
import prisma from '../lib/prisma';
import { recordCronRun } from '../lib/autonomyHealth';
import { logger } from '../utils/logger';

// This cron job runs every minute
export const startMilestoneApprover = () => {
  cron.schedule('* * * * *', async () => {
    logger.info('Running milestone auto-approver job...');
    const now = new Date();

    // Find milestones that are past their review deadline and are still funded
    const milestonesToApprove = await prisma.milestone.findMany({
      where: {
        status: 'FUNDED',
        reviewDeadlineAt: {
          lte: now,
        },
      },
    });

    if (milestonesToApprove.length > 0) {
      logger.info(`Found ${milestonesToApprove.length} milestones to auto-approve.`);
      for (const milestone of milestonesToApprove) {
        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: 'RELEASED' },
        });
        logger.info(`Auto-approved milestone ${milestone.id}`);
      }
      recordCronRun('milestone_approver', `autoApproved=${milestonesToApprove.length}`);
    } else {
      logger.info('No milestones to auto-approve.');
      recordCronRun('milestone_approver', 'autoApproved=0');
    }
  });
};

