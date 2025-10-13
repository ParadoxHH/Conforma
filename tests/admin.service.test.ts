import { describe, it, expect } from 'vitest';
import * as adminService from '../src/services/admin.service';
import { mockDeep } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('Admin Service', () => {
  it('should fetch all users', async () => {
    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.user.findMany.mockResolvedValue([]);

    await adminService.getAllUsers(mockPrisma);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('should fetch all jobs', async () => {
    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.job.findMany.mockResolvedValue([]);

    await adminService.getAllJobs(mockPrisma);
    expect(mockPrisma.job.findMany).toHaveBeenCalled();
  });

  it('should fetch all disputes', async () => {
    const mockPrisma = mockDeep<PrismaClient>();
    mockPrisma.dispute.findMany.mockResolvedValue([]);

    await adminService.getAllDisputes(mockPrisma);
    expect(mockPrisma.dispute.findMany).toHaveBeenCalled();
  });
});
