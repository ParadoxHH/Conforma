import { describe, it, expect, vi } from 'vitest';
import * as disputeService from '../src/services/dispute.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('Dispute Service', () => {
  it('should allow a homeowner to create a dispute', async () => {
    const milestoneId = 'milestone1';
    const reason = 'Work not completed';
    const homeownerUserId = 'user_homeowner';

    const mockPrisma = mockDeep<PrismaClient>();
    const mockNotificationService = { sendEmail: vi.fn() };

    const milestoneData = {
      id: milestoneId,
      job: {
        homeowner: { userId: homeownerUserId, user: { email: 'homeowner@test.com' } },
        contractor: { user: { email: 'contractor@test.com' } },
        title: 'Test Job',
      },
      title: 'Test Milestone',
    };
    mockPrisma.milestone.findUnique.mockResolvedValue(milestoneData as any);
    mockPrisma.dispute.create.mockResolvedValue({ id: 'dispute1' } as any);

    const dispute = await disputeService.createDispute(milestoneId, reason, homeownerUserId, mockPrisma, mockNotificationService as any);

    expect(dispute).toBeDefined();
    expect(mockPrisma.dispute.create).toHaveBeenCalled();
    expect(mockPrisma.milestone.update).toHaveBeenCalledWith({
      where: { id: milestoneId },
      data: { status: 'DISPUTED' },
    });
    expect(mockNotificationService.sendEmail).toHaveBeenCalledTimes(2); // Once for contractor, once for admin
  });

  it('should allow an admin to resolve a dispute', async () => {
    const disputeId = 'dispute1';
    const resolutionNotes = 'Resolved by admin';

    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.dispute.update.mockResolvedValue({ id: disputeId, status: 'RESOLVED' } as any);

    const dispute = await disputeService.resolveDispute(disputeId, resolutionNotes, mockPrisma);

    expect(dispute).toBeDefined();
    expect(dispute.status).toBe('RESOLVED');
    expect(mockPrisma.dispute.update).toHaveBeenCalled();
  });
});
