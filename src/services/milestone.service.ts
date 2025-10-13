import { PrismaClient, MilestoneStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const updateMilestoneStatus = async (milestoneId: string, status: MilestoneStatus) => {
  return prisma.milestone.update({
    where: { id: milestoneId },
    data: { status },
  });
};
