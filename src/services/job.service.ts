import { PrismaClient, JobStatus } from '@prisma/client';
import * as escrowService from './escrow.service';
import * as notificationService from './notification.service';
import prismaClient from '../lib/prisma';

export const createJob = async (
  data: any, 
  contractorId: string,
  prisma: PrismaClient = prismaClient,
  escrow: typeof escrowService = escrowService,
  notifications: typeof notificationService = notificationService
) => {
  const { title, description, totalPrice, homeownerId, milestones } = data;

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
      status: JobStatus.FUNDING_REQUIRED,
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
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
    },
  });

  const homeownerUser = job.homeowner.user;
  const contractorUser = job.contractor.user;
  const emailSubject = `New Job Created: ${job.title}`;
  const emailText = `Hello ${homeownerUser.email},\n\nContractor ${contractorUser.email} has created a new job for you: "${job.title}". Please log in to Conforma to review and fund the project.\n\nTotal Price: $${job.totalPrice}`;
  notifications.sendEmail(homeownerUser.email, emailSubject, emailText, `<p>${emailText.replace(/\n/g, '<br>')}</p>`);

  if (job.homeowner.phoneNumber) {
    const smsText = `Conforma: A new job "${job.title}" has been created for you. Please log in to review and fund the project.`;
    notifications.sendSms(job.homeowner.phoneNumber, smsText);
  }

  const escrowTransaction = await escrow.createTransaction({
    title,
    description,
    totalPrice,
    homeowner: job.homeowner.user,
    contractor: job.contractor.user,
  });

  const updatedJob = await prisma.job.update({
    where: { id: job.id },
    data: { escrowTransactionId: escrowTransaction.id },
    include: {
      milestones: true,
    },
  });

  return updatedJob;
};

export const getJobsByUser = async (userId: string, role: string, prisma: PrismaClient = prismaClient) => {
  const query = role === 'CONTRACTOR' ? { contractor: { userId } } : { homeowner: { userId } };
  return prisma.job.findMany({
    where: query,
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
      reviews: true,
    },
  });
};

export const getJobById = async (jobId: string, prisma: PrismaClient = prismaClient) => {
  return prisma.job.findUnique({
    where: { id: jobId },
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
      reviews: true,
    },
  });
};
