import { describe, it, expect } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient, SubscriptionTier } from '@prisma/client';
import { findBestContractorMatches } from '../src/services/matching.service';

const createMockPrisma = () => mockDeep<PrismaClient>();

describe('Matching Service', () => {
  it('scores contractors by verification, rating, and subscription tier', async () => {
    const prisma = createMockPrisma();
    prisma.contractor.findMany.mockResolvedValue([
      {
        id: 'c1',
        serviceAreas: ['78701'],
        trades: ['ROOFING'],
        verifiedKyc: true,
        verifiedLicense: true,
        verifiedInsurance: true,
        ratingAvg: 4.9,
        ratingCount: 25,
        subscriptionTier: 'VERIFIED',
        instantPayoutEnabled: true,
      },
      {
        id: 'c2',
        serviceAreas: ['78702'],
        trades: ['ROOFING'],
        verifiedKyc: false,
        verifiedLicense: true,
        verifiedInsurance: true,
        ratingAvg: 4.2,
        ratingCount: 5,
        subscriptionTier: 'FREE',
        instantPayoutEnabled: false,
      },
    ] as any);

    const matches = await findBestContractorMatches({ trade: 'Roofing', zip: '78701', budget: 12000 }, prisma);

    expect(matches).toHaveLength(2);
    expect(matches[0].contractorId).toBe('c1');
    expect(matches[0].score).toBeGreaterThan(matches[1].score);
    expect(matches[0].reasons.some((reason) => reason.includes('Verified'))).toBe(true);
  });
});
