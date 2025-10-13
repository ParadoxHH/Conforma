import cron from 'node-cron';
import prisma from '../lib/prisma';

// This cron job runs every minute
export const startMilestoneApprover = () => {
  cron.schedule('* * * * *', async () => {
    console.log('Running milestone auto-approver job...');
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
      console.log(`Found ${milestonesToApprove.length} milestones to auto-approve.`);
      for (const milestone of milestonesToApprove) {
        await prisma.milestone.update({
          where: { id: milestone.id },
          data: { status: 'RELEASED' },
        });
        // In a real app, you would also trigger a payout here
        // and send notifications.
        console.log(`Auto-approved milestone ${milestone.id}`);
      }
    } else {
      console.log('No milestones to auto-approve.');
    }
  });
};
