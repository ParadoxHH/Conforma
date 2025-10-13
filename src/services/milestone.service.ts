import { PrismaClient, MilestoneStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const updateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { status },
  });
};

export const submitMilestone = async (milestoneId: string, contractorUserId: string) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: { job: { include: { contractor: true } } },
  });

  if (!milestone || milestone.job.contractor.userId !== contractorUserId) {
    throw new Error('Unauthorized or milestone not found.');
  }

  const now = new Date();
  // As per Stage1.md, 3 days for mid, 5 for final.
  // This logic assumes we can tell if it's a final milestone.
  // For now, let's just use 3 days for all.
  const reviewDeadline = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

  return prisma.milestone.update({
    where: { id: milestoneId },
    data: {
      submittedAt: now,
      reviewDeadlineAt: reviewDeadline,
    },
  });
};