import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Role } from '@prisma/client';

import * as reviewService from '../src/services/review.service';

vi.mock('../src/services/notification.service', () => ({
  createInAppNotification: vi.fn(),
}));

describe('review.service', () => {
  const baseJob = {
    id: 'job-1',
    status: 'COMPLETED',
    contractorId: 'contractor-1',
    contractor: { userId: 'contractor-user' },
    homeowner: { userId: 'homeowner-user' },
  };

  const mockTx = {
    homeowner: {
      findUnique: vi.fn().mockResolvedValue({ id: 'homeowner-entity' }),
    },
    review: {
      create: vi.fn().mockResolvedValue({ id: 'review-1' }),
      aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 5 }, _count: { rating: 1 } }),
    },
    contractor: {
      update: vi.fn().mockResolvedValue({ id: 'contractor-1', ratingAvg: 5, ratingCount: 1 }),
    },
  } as any;

  const prisma = {
    job: {
      findUnique: vi.fn(),
    },
    review: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(async (cb: any) => cb(mockTx)),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a review for completed job', async () => {
    prisma.job.findUnique.mockResolvedValue(baseJob);
    prisma.review.findFirst.mockResolvedValue(null);

    const review = await reviewService.createReview(
      'job-1',
      { id: 'homeowner-user', role: Role.HOMEOWNER },
      { rating: 5, comment: 'Great work!' },
      prisma,
    );

    expect(review.id).toBe('review-1');
    expect(mockTx.review.create).toHaveBeenCalled();
    expect(mockTx.contractor.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'contractor-1' },
        data: expect.objectContaining({ ratingAvg: 5, ratingCount: 1 }),
      }),
    );
  });

  it('prevents duplicate reviews from same homeowner', async () => {
    prisma.job.findUnique.mockResolvedValue(baseJob);
    prisma.review.findFirst.mockResolvedValue({ id: 'existing' });

    await expect(
      reviewService.createReview(
        'job-1',
        { id: 'homeowner-user', role: Role.HOMEOWNER },
        { rating: 4 },
        prisma,
      ),
    ).rejects.toThrow('Review already exists');
  });
});
