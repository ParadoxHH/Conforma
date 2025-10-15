import { randomUUID } from 'crypto';
import {
  InviteStatus,
  InviteRole,
  PrismaClient,
  Role,
  Trade,
} from '@prisma/client';
import prismaClient from '../lib/prisma';
import * as notificationService from './notification.service';
import { logger } from '../utils/logger';
import * as argon2 from 'argon2';

const INVITE_EXPIRATION_DAYS = 7;

export type CreateInviteInput = {
  role: InviteRole;
  email: string;
  phone?: string;
  jobId?: string;
  createdByUserId: string;
};

export type AcceptInviteInput = {
  token: string;
  password: string;
  companyName?: string;
  serviceAreas?: string[];
  trades?: Trade[];
  displayName?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
};

async function assertJobAccess(
  jobId: string,
  userId: string,
  prisma: PrismaClient,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      homeowner: { select: { userId: true } },
      contractor: { select: { userId: true } },
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.homeowner.userId !== userId && job.contractor.userId !== userId) {
    throw new Error('Forbidden');
  }

  return job;
}

function computeExpirationDate() {
  const now = new Date();
  now.setDate(now.getDate() + INVITE_EXPIRATION_DAYS);
  return now;
}

export async function createInvite(
  input: CreateInviteInput,
  prisma: PrismaClient = prismaClient,
) {
  const { role, email, phone, jobId, createdByUserId } = input;

  if (jobId) {
    await assertJobAccess(jobId, createdByUserId, prisma);
  }

  const token = randomUUID();
  const expiresAt = computeExpirationDate();

  const invite = await prisma.invite.create({
    data: {
      role,
      email: email.toLowerCase(),
      phone,
      jobId,
      token,
      expiresAt,
      status: InviteStatus.PENDING,
    },
  });

  const emailSubject = 'You have been invited to Conforma';
  const emailBody = `You've been invited to join Conforma as a ${role.toLowerCase()}.

Please use the following link to accept the invitation and set up your account:
${process.env.FRONTEND_URL}/invitations/${token}

This invitation will expire on ${expiresAt.toDateString()}.`;

  try {
    await notificationService.sendEmail(
      email.toLowerCase(),
      emailSubject,
      emailBody,
      `<p>${emailBody.replace(/\n/g, '<br />')}</p>`,
    );
  } catch (error) {
    logger.error('Failed to send invite email', error);
  }

  await notificationService.createInAppNotification(createdByUserId, 'INVITE_CREATED', {
    inviteId: invite.id,
    email: invite.email,
  });

  return invite;
}

async function findInviteByToken(token: string, prisma: PrismaClient) {
  return prisma.invite.findUnique({
    where: { token },
  });
}

function ensureInviteActive(invite: { status: InviteStatus; expiresAt: Date }) {
  if (invite.status !== InviteStatus.PENDING) {
    throw new Error('Invite already processed');
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    throw new Error('Invite expired');
  }
}

async function ensureUserForInvite(
  invite: { email: string; role: InviteRole },
  password: string,
  prisma: PrismaClient,
) {
  const existingUser = await prisma.user.findUnique({
    where: { email: invite.email.toLowerCase() },
    include: { contractor: true, homeowner: true },
  });

  if (existingUser) {
    if (existingUser.role !== invite.role) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: invite.role,
        },
      });
    }
    if (existingUser.password === null && password) {
      const hashed = await argon2.hash(password);
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashed },
      });
    }
    return existingUser;
  }

  const hashedPassword = await argon2.hash(password);

  return prisma.user.create({
    data: {
      email: invite.email.toLowerCase(),
      password: hashedPassword,
      role: invite.role as Role,
    },
  });
}

export async function acceptInvite(
  input: AcceptInviteInput,
  prisma: PrismaClient = prismaClient,
) {
  const invite = await findInviteByToken(input.token, prisma);
  if (!invite) {
    throw new Error('Invite not found');
  }

  ensureInviteActive(invite);

  const user = await ensureUserForInvite(invite, input.password, prisma);

  const role = invite.role;

  await prisma.$transaction(async (tx) => {
    if (role === InviteRole.CONTRACTOR) {
      await tx.contractor.upsert({
        where: { userId: user.id },
        update: {
          companyName: input.companyName ?? undefined,
          serviceAreas: input.serviceAreas ?? undefined,
          trades: input.trades ?? undefined,
        },
        create: {
          userId: user.id,
          companyName: input.companyName ?? null,
          trade: input.trades && input.trades.length > 0 ? input.trades[0] : null,
          serviceAreas: input.serviceAreas ?? [],
          trades: input.trades ?? [],
        },
      });
    }

    if (role === InviteRole.HOMEOWNER) {
      await tx.homeowner.upsert({
        where: { userId: user.id },
        update: {
          displayName: input.displayName ?? undefined,
        },
        create: {
          userId: user.id,
          address: input.address ?? 'TBD',
          city: input.city ?? 'Austin',
          state: input.state ?? 'TX',
          zip: input.zip ?? '78701',
          displayName: input.displayName ?? null,
        },
      });
    }

    await tx.invite.update({
      where: { id: invite.id },
      data: {
        status: InviteStatus.ACCEPTED,
      },
    });
  });

  await notificationService.createInAppNotification(user.id, 'INVITE_ACCEPTED', {
    inviteId: invite.id,
  });

  return { userId: user.id, inviteId: invite.id };
}

export async function expireStaleInvites(prisma: PrismaClient = prismaClient) {
  const result = await prisma.invite.updateMany({
    where: {
      status: InviteStatus.PENDING,
      expiresAt: {
        lt: new Date(),
      },
    },
    data: {
      status: InviteStatus.EXPIRED,
    },
  });
  return result.count;
}

export async function getInviteByToken(
  token: string,
  prisma: PrismaClient = prismaClient,
) {
  return prisma.invite.findUnique({
    where: { token },
  });
}
