import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient, Role } from '@prisma/client';

import { evaluateJobFundingRisk, notifyRiskDecision } from '../src/services/risk.service';
import * as notificationService from '../src/services/notification.service';
import { notify } from '../src/lib/email/notifier';

vi.mock('../src/services/notification.service', () => ({
  createInAppNotification: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock('../src/lib/email/notifier', () => ({
  notify: vi.fn(),
}));

describe('risk.service', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  const baseJob: any = {
    id: 'job-1',
    totalPrice: 50000,
    createdAt: new Date(),
    contractorId: 'contractor-1',
    homeowner: {
      state: 'TX',
      user: { email: 'homeowner@test.com' },
    },
    contractor: {
      trade: 'ROOFING',
      trades: ['ROOFING'],
      user: { id: 'contractor-user', role: Role.CONTRACTOR },
    },
  };

  const notifyMock = vi.mocked(notify);
  const createNotificationMock = vi.mocked(notificationService.createInAppNotification);
  const sendEmailMock = vi.mocked(notificationService.sendEmail);

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    prisma.job.findUnique.mockResolvedValue(baseJob);
    prisma.dispute.count.mockResolvedValue(0);
    prisma.riskConfig.findUnique.mockResolvedValue({
      id: 1,
      allowThreshold: 25,
      blockThreshold: 50,
      maxJobAmountByTrade: { ROOFING: 30000 },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  it('returns BLOCK when cumulative risk score exceeds threshold', async () => {
    prisma.job.findUnique.mockResolvedValueOnce({
      ...baseJob,
      createdAt: new Date(Date.now() - 30 * 1000),
      homeowner: {
        state: 'CA',
        user: { email: 'owner@mailinator.com' },
      },
    });
    prisma.dispute.count.mockResolvedValue(2);

    const evaluation = await evaluateJobFundingRisk('job-1', prisma);

    expect(evaluation.decision).toBe('BLOCK');
    expect(evaluation.score).toBeGreaterThanOrEqual(50);
    expect(prisma.riskEvent.create).toHaveBeenCalled();
    expect(evaluation.reasons).toContain('DISPOSABLE_HOMEOWNER_EMAIL');
    expect(evaluation.reasons).toContain('HOMEOWNER_STATE_NOT_WHITELISTED');
  });

  it('defaults to ALLOW when no rules are triggered', async () => {
    prisma.job.findUnique.mockResolvedValueOnce({
      ...baseJob,
      totalPrice: 10000,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      homeowner: {
        state: 'TX',
        user: { email: 'owner@example.com' },
      },
    });
    prisma.dispute.count.mockResolvedValue(0);
    prisma.riskConfig.findUnique.mockResolvedValue(null);
    prisma.riskConfig.create.mockResolvedValue({
      id: 1,
      allowThreshold: 25,
      blockThreshold: 50,
      maxJobAmountByTrade: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const evaluation = await evaluateJobFundingRisk('job-safe', prisma);

    expect(evaluation.decision).toBe('ALLOW');
    expect(evaluation.score).toBeLessThan(25);
    expect(prisma.riskEvent.create).toHaveBeenCalled();
  });

  it('notifies admins and founders when risk evaluation blocks funding', async () => {
    prisma.user.findMany.mockResolvedValue([
      { id: 'admin-1', email: 'admin@conforma.com' } as any,
      { id: 'admin-2', email: null } as any,
    ]);

    notifyMock.mockResolvedValue();
    createNotificationMock.mockResolvedValue({} as any);
    sendEmailMock.mockResolvedValue();

    const evaluation: any = {
      job: {
        id: 'job-risky',
        title: 'High Voltage Upgrade',
        homeowner: { user: { email: 'homeowner@test.com' } },
        contractor: { user: { email: 'contractor@test.com' } },
      },
      score: 65,
      reasons: ['DISPOSABLE_HOMEOWNER_EMAIL', 'JOB_AMOUNT_ABOVE_TRADE_CAP'],
      decision: 'BLOCK',
      thresholds: { allow: 25, block: 50 },
      config: {},
    };

    process.env.FOUNDER_ALERT_EMAIL = 'founder@conforma.com';

    await notifyRiskDecision(evaluation, prisma);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: Role.ADMIN },
      select: { id: true, email: true },
    });
    expect(createNotificationMock).toHaveBeenCalledWith('admin-1', 'RISK_EVENT_REVIEW', expect.objectContaining({
      jobId: 'job-risky',
      score: 65,
      decision: 'BLOCK',
    }));
    expect(sendEmailMock).toHaveBeenCalledWith(
      'homeowner@test.com',
      expect.stringContaining('Funding blocked'),
      expect.any(String),
      expect.any(String),
    );
    expect(sendEmailMock).toHaveBeenCalledWith(
      'contractor@test.com',
      expect.stringContaining('Funding blocked'),
      expect.any(String),
      expect.any(String),
    );

    expect(notifyMock).toHaveBeenCalledWith('funding_blocked_alert', expect.objectContaining({
      to: 'admin@conforma.com',
      jobTitle: 'High Voltage Upgrade',
      score: 65,
      reasons: evaluation.reasons,
    }));
    expect(notifyMock).toHaveBeenCalledWith('funding_blocked_alert', expect.objectContaining({
      to: 'founder@conforma.com',
      jobTitle: 'High Voltage Upgrade',
      score: 65,
      reasons: evaluation.reasons,
    }));

    delete process.env.FOUNDER_ALERT_EMAIL;
  });
});
