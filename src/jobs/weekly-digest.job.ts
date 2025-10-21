import cron from 'node-cron';
import { JobStatus, PayoutStatus } from '@prisma/client';
import { PrismaClient, JobStatus, PayoutStatus } from '@prisma/client';
import prisma from '../lib/prisma';
import { autonomyConfig } from '../config/autonomy';
import { recordCronRun } from '../lib/autonomyHealth';
import { notify } from '../lib/email/notifier';
import { logger } from '../utils/logger';

const DIGEST_SCHEDULE = '0 12 * * 1'; // Mondays at 12:00 UTC

const hoursBetween = (start: Date, end: Date) =>
  Math.max(0, end.getTime() - start.getTime()) / (1000 * 60 * 60);

type ExecuteWeeklyDigestOptions = {
  founderEmail: string;
  prismaClient?: PrismaClient;
  windowStart?: Date;
  windowEnd?: Date;
  notifyFn?: typeof notify;
};

export const executeWeeklyDigest = async ({
  founderEmail,
  prismaClient = prisma,
  windowStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  windowEnd = new Date(),
  notifyFn = notify,
}: ExecuteWeeklyDigestOptions) => {
  const [
    newSignups,
    fundedJobs,
    settledPayouts,
    disputesOpened,
    disputesResolved,
    verificationApprovals,
    riskFlags,
  ] = await Promise.all([
    prismaClient.user.count({ where: { createdAt: { gte: windowStart } } }),
    prismaClient.job.count({
      where: {
        updatedAt: { gte: windowStart },
        status: { in: [JobStatus.IN_PROGRESS, JobStatus.COMPLETED] },
      },
    }),
    prismaClient.payout.findMany({
      where: {
        status: PayoutStatus.SETTLED,
        updatedAt: { gte: windowStart },
      },
      select: { createdAt: true, updatedAt: true },
    }),
    prismaClient.dispute.count({ where: { createdAt: { gte: windowStart } } }),
    prismaClient.dispute.count({
      where: { status: 'RESOLVED', updatedAt: { gte: windowStart } },
    }),
    prismaClient.document.count({
      where: { status: 'APPROVED', updatedAt: { gte: windowStart } },
    }),
    prismaClient.riskEvent.count({
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

  await notifyFn('weekly_founder_digest', {
    to: founderEmail,
    windowStart,
    windowEnd,
    metrics: {
      newSignups,
      fundedJobs,
      avgPayoutLatencyHours: avgPayoutLatency,
      disputesOpened,
      disputesResolved,
      verificationApprovals,
      riskFlags,
    },
  });

  return {
    windowStart,
    windowEnd,
    metrics: {
      newSignups,
      fundedJobs,
      avgPayoutLatencyHours: avgPayoutLatency,
      disputesOpened,
      disputesResolved,
      verificationApprovals,
      riskFlags,
    },
  };
};

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
    try {
      await executeWeeklyDigest({ founderEmail });
      recordCronRun('weekly_digest');
    } catch (error) {
      logger.error('Weekly digest job failed', error);
      recordCronRun('weekly_digest', `failed: ${(error as Error).message}`);
    }
  });
};
