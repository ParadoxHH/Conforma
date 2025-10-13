import { PrismaClient } from '@prisma/client';
import prismaClient from '../lib/prisma';

export const getAllUsers = (prisma: PrismaClient = prismaClient) => {
  return prisma.user.findMany({
    include: {
      homeowner: true,
      contractor: true,
    },
  });
};

export const getAllJobs = (prisma: PrismaClient = prismaClient) => {
  return prisma.job.findMany({
    include: {
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
      milestones: true,
    },
  });
};

export const getAllDisputes = (prisma: PrismaClient = prismaClient) => {
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
