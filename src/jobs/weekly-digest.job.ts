import cron from 'node-cron';
import { JobStatus, PayoutStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { autonomyConfig } from '../config/autonomy';
import { recordCronRun } from '../lib/autonomyHealth';
import * as notificationService from '../services/notification.service';
import { logger } from '../utils/logger';

const DIGEST_SCHEDULE = '0 12 * * 1'; // Mondays at 12:00 UTC

const hoursBetween = (start: Date, end: Date) =>
  Math.max(0, end.getTime() - start.getTime()) / (1000 * 60 * 60);

export const startWeeklyDigestJob = () => {
  if (!autonomyConfig.autonomyEnabled || !autonomyConfig.weeklyDigestEnabled) {
    return;
  }

  const founderEmail = process.env.FOUNDER_ALERT_EMAIL;
  if (!founderEmail) {
    logger.warn('Weekly digest disabled: FOUNDER_ALERT_EMAIL not configured');
    return;
  }

  cron.schedule(DIGEST_SCHEDULE, async () => {
    const windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const windowEnd = new Date();

    try {
      const [
        newSignups,
        fundedJobs,
        settledPayouts,
        disputesOpened,
        disputesResolved,
        verificationApprovals,
        riskFlags,
      ] = await Promise.all([
        prisma.user.count({ where: { createdAt: { gte: windowStart } } }),
        prisma.job.count({
          where: {
            updatedAt: { gte: windowStart },
            status: { in: [JobStatus.IN_PROGRESS, JobStatus.COMPLETED] },
          },
        }),
        prisma.payout.findMany({
          where: {
            status: PayoutStatus.SETTLED,
            updatedAt: { gte: windowStart },
          },
          select: { createdAt: true, updatedAt: true },
        }),
        prisma.dispute.count({ where: { createdAt: { gte: windowStart } } }),
        prisma.dispute.count({
          where: { status: 'RESOLVED', updatedAt: { gte: windowStart } },
        }),
        prisma.document.count({
          where: { status: 'APPROVED', updatedAt: { gte: windowStart } },
        }),
        prisma.riskEvent.count({
          where: { createdAt: { gte: windowStart }, score: { gte: 25 } },
        }),
      ]);

      const avgPayoutLatency =
        settledPayouts.length === 0
          ? 0
          : settledPayouts.reduce(
              (total, payout) => total + hoursBetween(payout.createdAt, payout.updatedAt),
              0,
            ) / settledPayouts.length;

      const digestBody = [
        `Digest window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
        '',
        `• New signups: ${newSignups}`,
        `• Funded jobs: ${fundedJobs}`,
        `• Avg payout latency: ${avgPayoutLatency.toFixed(2)} hours`,
        `• Disputes opened / resolved: ${disputesOpened} / ${disputesResolved}`,
        `• Verification approvals: ${verificationApprovals}`,
        `• Risk flags: ${riskFlags}`,
      ].join('\n');

      await notificationService.sendEmail(
        founderEmail,
        'Conforma weekly autonomy digest',
        `${digestBody}\n\nView autonomy status at /api/autonomy/health`,
        `<p>${digestBody.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p><p>View autonomy status at /api/autonomy/health</p>`,
      );

      recordCronRun('weekly_digest');
    } catch (error) {
      logger.error('Weekly digest job failed', error);
      recordCronRun('weekly_digest', `failed: ${(error as Error).message}`);
    }
  });
};
