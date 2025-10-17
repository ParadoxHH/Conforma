import { describe, it, expect } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import {
  ensureReferralCode,
  getReferralSummary,
  redeemReferralCredit,
} from '../src/services/referral.service';

const createMockPrisma = () => mockDeep<PrismaClient>();

describe('Referral Service', () => {
  it('generates a referral code when missing', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', referralCode: null } as any);
    prisma.user.findFirst.mockResolvedValue(null as any);
    prisma.user.update.mockResolvedValue({ id: 'user-1', referralCode: 'REF-ABC123' } as any);

    const code = await ensureReferralCode('user-1', prisma);
    expect(code).toMatch(/^REF-/);
    expect(prisma.user.update).toHaveBeenCalled();
  });

  it('computes referral summary with credits', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 'referrer', referralCode: 'REF-123', referredByCode: null } as any);
    prisma.referralEvent.findMany.mockResolvedValue([
      { event: 'SIGNED_UP' } as any,
      { event: 'FIRST_FUNDED_JOB' } as any,
      { event: 'FIRST_FUNDED_JOB' } as any,
      { event: 'CREDIT_REDEEMED' } as any,
    ]);

    const summary = await getReferralSummary('referrer', prisma);
    expect(summary.stats.signups).toBe(1);
    expect(summary.stats.firstFundedJobs).toBe(2);
    expect(summary.stats.credits).toBe(1);
  });

  it('redeems a credit when available', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValue({ id: 'referrer', referralCode: 'REF-123', referredByCode: null } as any);
    prisma.referralEvent.findMany.mockResolvedValue([
      { event: 'FIRST_FUNDED_JOB' } as any,
    ]);

    await redeemReferralCredit('referrer', prisma);
    expect(prisma.referralEvent.create).toHaveBeenCalledWith({
      data: {
        referrerUserId: 'referrer',
        referredUserId: null,
        event: 'CREDIT_REDEEMED',
      },
    });
  });
});

