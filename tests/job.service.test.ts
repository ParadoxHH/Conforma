import { describe, it, expect, vi } from 'vitest';
import * as jobService from '../src/services/job.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('Job Service', () => {
  it('should create a new job and trigger notifications and escrow', async () => {
    const jobData = {
      title: 'Test Job',
      description: 'Test Description',
      totalPrice: 1000,
      homeownerId: 'homeowner1',
      milestones: [{ title: 'Milestone 1', price: 1000 }],
    };
    const contractorId = 'contractor1';

    const mockPrisma = mockDeep<PrismaClient>();
    const mockEscrowService = { createTransaction: vi.fn().mockResolvedValue({ id: 'escrow123' }) };
    const mockNotificationService = { sendEmail: vi.fn(), sendSms: vi.fn() };

    const createdJob = {
      ...jobData,
      id: 'job1',
      contractorId,
      status: 'FUNDING_REQUIRED',
      homeowner: { user: { email: 'homeowner@test.com' }, phoneNumber: '+1234567890' },
      contractor: { user: { email: 'contractor@test.com' } },
    };

    mockPrisma.job.create.mockResolvedValue(createdJob as any);
    mockPrisma.job.update.mockResolvedValue({ ...createdJob, escrowTransactionId: 'escrow123' } as any);

    const job = await jobService.createJob(jobData, contractorId, mockPrisma, mockEscrowService as any, mockNotificationService as any);

    expect(job).toBeDefined();
    expect(job.escrowTransactionId).toBe('escrow123');
    expect(mockPrisma.job.create).toHaveBeenCalled();
    expect(mockEscrowService.createTransaction).toHaveBeenCalled();
    expect(mockNotificationService.sendEmail).toHaveBeenCalled();
    expect(mockNotificationService.sendSms).toHaveBeenCalled();
  });

  it('should throw an error if milestone prices do not sum to total price', async () => {
    const jobData = {
      title: 'Test Job',
      description: 'Test Description',
      totalPrice: 1000,
      homeownerId: 'homeowner1',
      milestones: [{ title: 'Milestone 1', price: 500 }], // Price mismatch
    };
    const contractorId = 'contractor1';

    const mockPrisma = mockDeep<PrismaClient>();

    await expect(jobService.createJob(jobData, contractorId, mockPrisma)).rejects.toThrow(
      'The sum of milestone prices must equal the total job price.'
    );
  });
});
