import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as disputeService from '../src/services/dispute.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { notify } from '../src/lib/email/notifier';

vi.mock('../src/lib/email/notifier', () => ({
  notify: vi.fn(),
}));

const mockedNotify = vi.mocked(notify);

beforeEach(() => {
  vi.clearAllMocks();
  mockedNotify.mockResolvedValue(undefined as any);
});

describe('Dispute Service', () => {
  it('should allow a homeowner to create a dispute', async () => {
    process.env.FOUNDER_ALERT_EMAIL = '';
    const milestoneId = 'milestone1';
    const reason = 'Work not completed';
    const homeownerUserId = 'user_homeowner';

    const mockPrisma = mockDeep<PrismaClient>();

    const milestoneData = {
      id: milestoneId,
      job: {
        homeowner: { userId: homeownerUserId, user: { email: 'homeowner@test.com' } },
        contractor: { user: { email: 'contractor@test.com' } },
        title: 'Test Job',
        id: 'job1',
      },
      title: 'Test Milestone',
    };
    mockPrisma.milestone.findUnique.mockResolvedValue(milestoneData as any);
    mockPrisma.dispute.create.mockResolvedValue({ id: 'dispute1' } as any);

    const dispute = await disputeService.createDispute(milestoneId, reason, homeownerUserId, mockPrisma);

    expect(dispute).toBeDefined();
    expect(mockPrisma.dispute.create).toHaveBeenCalled();
    expect(mockPrisma.milestone.update).toHaveBeenCalledWith({
      where: { id: milestoneId },
      data: { status: 'DISPUTED' },
    });
    expect(mockPrisma.job.update).toHaveBeenCalled();
    expect(mockedNotify).toHaveBeenCalledTimes(1);
    expect(mockedNotify).toHaveBeenCalledWith('dispute_opened', expect.objectContaining({ to: 'contractor@test.com' }));
  });

  it('should allow an admin to resolve a dispute', async () => {
    process.env.FOUNDER_ALERT_EMAIL = '';
    const disputeId = 'dispute1';
    const resolutionNotes = 'Resolved by admin';

    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.dispute.update.mockResolvedValue({
      id: disputeId,
      status: 'RESOLVED',
      milestone: {
        title: 'Milestone',
        job: {
          title: 'Job',
          homeowner: { user: { email: 'homeowner@test.com' } },
          contractor: { user: { email: 'contractor@test.com' } },
        },
      },
    } as any);

    const dispute = await disputeService.resolveDispute(disputeId, resolutionNotes, mockPrisma);

    expect(dispute).toBeDefined();
    expect(dispute.status).toBe('RESOLVED');
    expect(mockPrisma.dispute.update).toHaveBeenCalled();
    expect(mockedNotify).toHaveBeenCalledWith('dispute_resolved', expect.objectContaining({ to: 'homeowner@test.com' }));
    expect(mockedNotify).toHaveBeenCalledWith('dispute_resolved', expect.objectContaining({ to: 'contractor@test.com' }));
  });
});
