import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient, Role } from '@prisma/client';

import { evaluateJobFundingRisk } from '../src/services/risk.service';

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
});
