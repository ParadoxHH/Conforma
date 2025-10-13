import { PrismaClient, JobStatus } from '@prisma/client';

const prisma = new PrismaClient();

export const createJob = async (data: any, contractorId: string) => {
  const { title, description, totalPrice, homeownerId, milestones } = data;

  // Basic validation
  if (milestones.length === 0 || milestones.length > 3) {
    throw new Error('A job must have between 1 and 3 milestones.');
  }

  const milestonesTotalPrice = milestones.reduce((sum: number, m: any) => sum + m.price, 0);
  if (milestonesTotalPrice !== totalPrice) {
    throw new Error('The sum of milestone prices must equal the total job price.');
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      totalPrice,
      contractorId,
      homeownerId,
      status: JobStatus.PENDING,
      milestones: {
        create: milestones.map((m: any) => ({
          title: m.title,
          price: m.price,
          status: 'PENDING',
        })),
      },
    },
    include: {
      milestones: true,
    },
  });

  return job;
};

export const getJobsByUser = async (userId: string, role: string) => {
  const query = role === 'CONTRACTOR' ? { contractor: { userId } } : { homeowner: { userId } };
  return prisma.job.findMany({
    where: query,
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
    },
  });
};

export const getJobById = async (jobId: string) => {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
    },
  });
};
