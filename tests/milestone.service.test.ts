import { describe, it, expect, vi } from 'vitest';
import * as milestoneService from '../src/services/milestone.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient, MilestoneStatus } from '@prisma/client';

describe('Milestone Service', () => {
  it('should update a milestone status', async () => {
    const milestoneId = 'milestone1';
    const newStatus = MilestoneStatus.RELEASED;

    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.milestone.update.mockResolvedValue({ id: milestoneId, status: newStatus } as any);

    const milestone = await milestoneService.updateMilestoneStatus(milestoneId, newStatus, mockPrisma);

    expect(milestone).toBeDefined();
    expect(milestone.status).toBe(newStatus);
    expect(mockPrisma.milestone.update).toHaveBeenCalledWith({
      where: { id: milestoneId },
      data: { status: newStatus },
    });
  });

  it('should allow a contractor to submit a milestone', async () => {
    const milestoneId = 'milestone1';
    const contractorUserId = 'user_contractor';

    const mockPrisma = mockDeep<PrismaClient>();
    const milestoneData = {
      id: milestoneId,
      job: { contractor: { userId: contractorUserId } },
    };
    mockPrisma.milestone.findUnique.mockResolvedValue(milestoneData as any);
    mockPrisma.milestone.update.mockResolvedValue({ ...milestoneData, submittedAt: new Date() } as any);

    const milestone = await milestoneService.submitMilestone(milestoneId, contractorUserId, mockPrisma);

    expect(milestone).toBeDefined();
    expect(milestone.submittedAt).toBeInstanceOf(Date);
    expect(mockPrisma.milestone.update).toHaveBeenCalled();
  });

  it('should prevent an unauthorized user from submitting a milestone', async () => {
    const milestoneId = 'milestone1';
    const wrongContractorId = 'user_wrong_contractor';

    const mockPrisma = mockDeep<PrismaClient>();
    const milestoneData = {
      id: milestoneId,
      job: { contractor: { userId: 'user_correct_contractor' } },
    };
    mockPrisma.milestone.findUnique.mockResolvedValue(milestoneData as any);

    await expect(milestoneService.submitMilestone(milestoneId, wrongContractorId, mockPrisma)).rejects.toThrow(
      'Unauthorized or milestone not found.'
    );
  });
});
