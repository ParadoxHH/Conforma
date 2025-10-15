import { describe, expect, it, vi, beforeEach } from 'vitest';
import { InviteRole, InviteStatus } from '@prisma/client';

import * as inviteService from '../src/services/invite.service';

vi.mock('../src/services/notification.service', () => ({
  sendEmail: vi.fn(),
  createInAppNotification: vi.fn(),
}));

describe('invite.service', () => {
  const prisma = {
    job: {
      findUnique: vi.fn(),
    },
    invite: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    contractor: {
      upsert: vi.fn(),
    },
    homeowner: {
      upsert: vi.fn(),
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('expires stale invites', async () => {
    prisma.invite.updateMany.mockResolvedValue({ count: 3 });
    const expired = await inviteService.expireStaleInvites(prisma);
    expect(expired).toBe(3);
  });

  it('creates invite and normalizes email', async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: 'job',
      homeowner: { userId: 'creator' },
      contractor: { userId: 'creator' },
    });
    prisma.invite.create.mockResolvedValue({
      id: 'invite',
      role: InviteRole.CONTRACTOR,
      email: 'test@example.com',
      status: InviteStatus.PENDING,
      expiresAt: new Date(),
    });

    const invite = await inviteService.createInvite(
      {
        role: InviteRole.CONTRACTOR,
        email: 'Test@Example.com',
        jobId: 'job',
        createdByUserId: 'creator',
      },
      prisma,
    );

    expect(invite.email).toBe('test@example.com');
    expect(prisma.invite.create).toHaveBeenCalled();
  });
});
