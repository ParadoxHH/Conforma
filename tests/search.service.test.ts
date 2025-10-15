import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Trade } from '@prisma/client';

import * as searchService from '../src/services/search.service';

describe('search.service', () => {
  const prisma = {
    contractor: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (queries: any[]) => {
      const [countPromise, listPromise] = queries;
      const total = await countPromise;
      const results = await listPromise;
      return [total, results];
    }),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('filters by verified contractors and minimum rating', async () => {
    prisma.contractor.count.mockResolvedValue(1);
    prisma.contractor.findMany.mockResolvedValue([
      {
        id: 'contractor-1',
        userId: 'user-1',
        companyName: 'Reliable Roofers',
        trades: [Trade.ROOFING],
        serviceAreas: ['78701', '78702'],
        verifiedKyc: true,
        verifiedLicense: true,
        verifiedInsurance: true,
        ratingAvg: 4.8,
        ratingCount: 12,
        user: {
          avatarUrl: null,
          bio: 'Austin roofing specialists',
          createdAt: new Date().toISOString(),
        },
      },
    ]);

    const result = await searchService.searchContractors(
      { verified: true, minRating: 4.5, zip: '78701', radius: 10 },
      prisma,
    );

    expect(result.total).toBe(1);
    expect(result.results[0].companyName).toBe('Reliable Roofers');
    expect(prisma.contractor.count).toHaveBeenCalledWith(expect.objectContaining({ where: expect.any(Object) }));
  });
});
