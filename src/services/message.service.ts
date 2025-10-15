import { PrismaClient, Role } from '@prisma/client';
import prismaClient from '../lib/prisma';
import * as notificationService from './notification.service';

type MessageInput = {
  body: string;
  attachments?: Array<{ url: string; type: string }>;
};

async function getJobWithParticipants(jobId: string, prisma: PrismaClient) {
  return prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      homeowner: { select: { userId: true } },
      contractor: { select: { userId: true } },
    },
  });
}

function assertJobParticipant(
  job: Awaited<ReturnType<typeof getJobWithParticipants>>,
  user: { id: string; role: Role },
) {
  if (!job) {
    throw new Error('Job not found');
  }

  if (user.role === Role.ADMIN) {
    return;
  }

  if (job.homeowner.userId !== user.id && job.contractor.userId !== user.id) {
    throw new Error('Forbidden');
  }
}

export async function listMessages(
  jobId: string,
  user: { id: string; role: Role },
  prisma: PrismaClient = prismaClient,
) {
  const job = await getJobWithParticipants(jobId, prisma);
  assertJobParticipant(job, user);

  return prisma.message.findMany({
    where: { jobId },
    include: {
      sender: {
        select: { id: true, email: true, role: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

export async function createMessage(
  jobId: string,
  user: { id: string; role: Role },
  input: MessageInput,
  prisma: PrismaClient = prismaClient,
) {
  const job = await getJobWithParticipants(jobId, prisma);
  assertJobParticipant(job, user);

  const message = await prisma.message.create({
    data: {
      jobId,
      senderUserId: user.id,
      body: input.body,
      attachments: input.attachments ?? undefined,
    },
    include: {
      sender: {
        select: {
          id: true,
          email: true,
          role: true,
          avatarUrl: true,
        },
      },
    },
  });

  const targetUserIds = new Set<string>();
  if (job?.homeowner.userId && job.homeowner.userId !== user.id) {
    targetUserIds.add(job.homeowner.userId);
  }
  if (job?.contractor.userId && job.contractor.userId !== user.id) {
    targetUserIds.add(job.contractor.userId);
  }

  await Promise.all(
    Array.from(targetUserIds).map((userId) =>
      notificationService.createInAppNotification(userId, 'MESSAGE_RECEIVED', {
        jobId,
        messageId: message.id,
      }),
    ),
  );

  return message;
}

export async function markMessagesRead(
  jobId: string,
  user: { id: string; role: Role },
  prisma: PrismaClient = prismaClient,
) {
  const job = await getJobWithParticipants(jobId, prisma);
  assertJobParticipant(job, user);

  const unreadMessages = await prisma.message.findMany({
    where: {
      jobId,
      NOT: {
        readByUserIds: {
          has: user.id,
        },
      },
    },
    select: { id: true },
  });

  await prisma.$transaction(
    unreadMessages.map((msg) =>
      prisma.message.update({
        where: { id: msg.id },
        data: {
          readByUserIds: {
            push: user.id,
          },
        },
      }),
    ),
  );

  return unreadMessages.length;
}
