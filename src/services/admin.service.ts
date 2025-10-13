import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = () => {
  return prisma.user.findMany({
    include: {
      homeowner: true,
      contractor: true,
    },
  });
};

export const getAllJobs = () => {
  return prisma.job.findMany({
    include: {
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
      milestones: true,
    },
  });
};

export const getAllDisputes = () => {
  return prisma.dispute.findMany({
    include: {
      milestone: {
        include: {
          job: true,
        },
      },
    },
  });
};
