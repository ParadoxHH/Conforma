import { PrismaClient, MilestoneStatus } from '@prisma/client';
import prismaClient from '../lib/prisma';

export const updateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus, prisma: PrismaClient = prismaClient) => {
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { status },
  });
};

export const submitMilestone = async (milestoneId: string, contractorUserId: string, prisma: PrismaClient = prismaClient) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { job: { include: { contractor: true } } },
  });

  if (!milestone || milestone.job.contractor.userId !== contractorUserId) {
    throw new Error('Unauthorized or milestone not found.');
  }

  const now = new Date();
  const reviewDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      submittedAt: now,
      reviewDeadlineAt: reviewDeadline,
    },
  });
};