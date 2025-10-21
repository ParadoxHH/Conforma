import { describe, it, expect, vi } from 'vitest';
import * as jobService from '../src/services/job.service';
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

    const mockStateRule = {
      findUnique: vi.fn().mockResolvedValue({
        code: 'TX',
        name: 'Texas',
        reviewWindowMidDays: 3,
        reviewWindowFinalDays: 5,
        platformFeeBps: 150,
        kycRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    const mockPrisma = {
      contractor: {
        findUnique: vi.fn().mockResolvedValue({
          id: contractorId,
          subscriptionTier: 'FREE',
          subscriptionStatus: 'ACTIVE',
          instantPayoutEnabled: false,
          user: { email: 'contractor@test.com' },
        }),
      },
      homeowner: {
        findUnique: vi.fn().mockResolvedValue({
          id: jobData.homeownerId,
          state: 'TX',
          user: { email: 'homeowner@test.com' },
          phoneNumber: '+1234567890',
        }),
      },
      job: {
        create: vi.fn(),
        update: vi.fn(),
      },
      stateRule: mockStateRule,
    } as unknown as PrismaClient;

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

    (mockPrisma.job.create as any).mockResolvedValue(createdJob);
    (mockPrisma.job.update as any).mockResolvedValue({ ...createdJob, escrowTransactionId: 'escrow123' });

    const job = await jobService.createJob(jobData, contractorId, mockPrisma, mockEscrowService as any, mockNotificationService as any);

    expect(job).toBeDefined();
    expect(job.escrowTransactionId).toBe('escrow123');
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
      milestones: [{ title: 'Milestone 1', price: 500 }],
    };
    const contractorId = 'contractor1';

    const mockPrisma = {
      contractor: { findUnique: vi.fn() },
      homeowner: { findUnique: vi.fn() },
      job: { create: vi.fn(), update: vi.fn() },
      stateRule: {
        findUnique: vi.fn().mockResolvedValue({
          code: 'TX',
          name: 'Texas',
          reviewWindowMidDays: 3,
          reviewWindowFinalDays: 5,
          platformFeeBps: 150,
          kycRequired: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      },
    } as unknown as PrismaClient;

    await expect(jobService.createJob(jobData, contractorId, mockPrisma)).rejects.toThrow(
      'The sum of milestone prices must equal the total job price.'
    );
  });
});
