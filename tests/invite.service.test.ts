import { beforeEach, describe, expect, it, vi } from "vitest";
import { InviteRole, InviteStatus } from "@prisma/client";

import * as inviteService from "../src/services/invite.service";
import { notify } from "../src/lib/email/notifier";

vi.mock("../src/services/notification.service", () => ({
  createInAppNotification: vi.fn(),
}));

vi.mock("../src/lib/email/notifier", () => ({
  notify: vi.fn(),
}));

const mockedNotify = vi.mocked(notify);

describe("invite.service", () => {
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
    mockedNotify.mockResolvedValue(undefined as any);
  });

  it("expires stale invites", async () => {
    prisma.invite.updateMany.mockResolvedValue({ count: 3 });
    const expired = await inviteService.expireStaleInvites(prisma);
    expect(expired).toBe(3);
  });

  it("creates invite and normalizes email", async () => {
    prisma.job.findUnique.mockResolvedValue({
      id: "job",
      title: "Job",
      homeowner: { userId: "creator", user: { email: "homeowner@test.com" } },
      contractor: { userId: "creator", user: { email: "contractor@test.com" } },
    });
    prisma.user.findUnique.mockResolvedValue({ email: "owner@conforma.com" });
    prisma.invite.create.mockResolvedValue({
      id: "invite",
      role: InviteRole.CONTRACTOR,
      email: "test@example.com",
      status: InviteStatus.PENDING,
      expiresAt: new Date(),
    });

    const invite = await inviteService.createInvite(
      {
        role: InviteRole.CONTRACTOR,
        email: "Test@Example.com",
        jobId: "job",
        createdByUserId: "creator",
      },
      prisma,
    );

    expect(invite.email).toBe("test@example.com");
    expect(prisma.invite.create).toHaveBeenCalled();
    expect(mockedNotify).toHaveBeenCalledWith(
      "invite_sent",
      expect.objectContaining({ to: "test@example.com", acceptUrl: expect.stringContaining('/invitations') }),
    );
  });
});
