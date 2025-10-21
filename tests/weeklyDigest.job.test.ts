import { describe, expect, it, vi } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient, PayoutStatus } from '@prisma/client';

import { executeWeeklyDigest } from '../src/jobs/weekly-digest.job';

describe('weekly-digest.job', () => {
  const founderEmail = 'founder@test.com';

  const baseWindowEnd = new Date('2025-10-21T12:00:00Z');
  const baseWindowStart = new Date(baseWindowEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const buildMockPrisma = () => {
    const prisma = mockDeep<PrismaClient>();
    prisma.user.count.mockResolvedValue(12);
    prisma.job.count.mockResolvedValue(7);
    prisma.payout.findMany.mockResolvedValue([
      { createdAt: new Date('2025-10-18T10:00:00Z'), updatedAt: new Date('2025-10-19T12:00:00Z'), status: PayoutStatus.SETTLED } as any,
      { createdAt: new Date('2025-10-19T09:00:00Z'), updatedAt: new Date('2025-10-19T15:00:00Z'), status: PayoutStatus.SETTLED } as any,
    ]);
    prisma.dispute.count.mockResolvedValueOnce(2); // opened
    prisma.dispute.count.mockResolvedValueOnce(1); // resolved
    prisma.document.count.mockResolvedValue(5);
    prisma.riskEvent.count.mockResolvedValue(3);
    return prisma;
  };

  it('notifies founder with aggregated metrics', async () => {
    const prisma = buildMockPrisma();
    const notifyFn = vi.fn().mockResolvedValue(undefined);

    const result = await executeWeeklyDigest({
      founderEmail,
      prismaClient: prisma,
      windowStart: baseWindowStart,
      windowEnd: baseWindowEnd,
      notifyFn,
    });

    expect(prisma.user.count).toHaveBeenCalledWith({ where: { createdAt: { gte: baseWindowStart } } });
    expect(notifyFn).toHaveBeenCalledWith('weekly_founder_digest', {
      to: founderEmail,
      windowStart: baseWindowStart,
      windowEnd: baseWindowEnd,
      metrics: expect.objectContaining({
        newSignups: 12,
        fundedJobs: 7,
        disputesOpened: 2,
        disputesResolved: 1,
        verificationApprovals: 5,
        riskFlags: 3,
      }),
    });

    expect(result.metrics.avgPayoutLatencyHours).toBeGreaterThan(0);
  });

  it('handles zero settled payouts without NaN latency', async () => {
    const prisma = buildMockPrisma();
    prisma.payout.findMany.mockResolvedValue([]);
    const notifyFn = vi.fn().mockResolvedValue(undefined);

    const result = await executeWeeklyDigest({
      founderEmail,
      prismaClient: prisma,
      windowStart: baseWindowStart,
      windowEnd: baseWindowEnd,
      notifyFn,
    });

    expect(result.metrics.avgPayoutLatencyHours).toBe(0);
  });
});
