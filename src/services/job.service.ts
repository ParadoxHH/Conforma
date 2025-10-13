import { PrismaClient, JobStatus } from '@prisma/client';
import * as escrowService from './escrow.service';
import * as notificationService from './notification.service';

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

  // Create the job in our database first
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

  // Send notifications
  const homeownerUser = job.homeowner.user;
  const contractorUser = job.contractor.user;
  const emailSubject = `New Job Created: ${job.title}`;
  const emailText = `Hello ${homeownerUser.email},\n\nContractor ${contractorUser.email} has created a new job for you: "${job.title}". Please log in to Conforma to review and fund the project.\n\nTotal Price: $${job.totalPrice}`;
  notificationService.sendEmail(homeownerUser.email, emailSubject, emailText, `<p>${emailText.replace(/\n/g, '<br>')}</p>`);

  if (job.homeowner.phoneNumber) {
    const smsText = `Conforma: A new job "${job.title}" has been created for you. Please log in to review and fund the project.`;
    notificationService.sendSms(job.homeowner.phoneNumber, smsText);
  }


  // Now create the transaction on Escrow.com
  const escrowTransaction = await escrowService.createTransaction({
    title,
    description,
    totalPrice,
    homeowner: job.homeowner.user,
    contractor: job.contractor.user,
  });

  // Update our job with the Escrow.com transaction ID
  const updatedJob = await prisma.job.update({
    where: { id: job.id },
    data: { escrowTransactionId: escrowTransaction.id },
    include: {
      milestones: true,
    },
  });

  return updatedJob;
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
