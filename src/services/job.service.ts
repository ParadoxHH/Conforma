import { PrismaClient, JobStatus } from '@prisma/client';
import * as escrowService from './escrow.service';
import * as notificationService from './notification.service';
import prismaClient from '../lib/prisma';
import { calculateFees } from '../utils/fees';
import { appConfig } from '../config/app.config';
import { getStateRule } from '../config/state.config';

type MilestoneInput = {
  title: string;
  price: number;
};

type CreateJobInput = {
  title: string;
  description: string;
  totalPrice: number;
  homeownerId: string;
  milestones: MilestoneInput[];
  platformFeeBps?: number;
  stateCode?: string;
};

const resolvePlatformFeeBps = (baseFeeBps: number, tier: string) => {
  if (tier === 'VERIFIED') {
    return Math.max(baseFeeBps - 75, 25);
  }

  if (tier === 'PRO') {
    return Math.max(baseFeeBps - 25, 50);
  }

  return baseFeeBps;
};

export const createJob = async (
  data: CreateJobInput,
  contractorId: string,
  prisma: PrismaClient = prismaClient,
  escrow: typeof escrowService = escrowService,
  notifications: typeof notificationService = notificationService,
) => {
  const { title, description, totalPrice, homeownerId, milestones, stateCode: requestedStateCode } = data;

  if (!Array.isArray(milestones) || milestones.length === 0 || milestones.length > 3) {
    throw new Error('Jobs require between 1 and 3 milestones.');
  }

  const invalidMilestone = milestones.find(
    (milestone) =>
      !milestone ||
      typeof milestone.title !== 'string' ||
      milestone.title.trim() === '' ||
      typeof milestone.price !== 'number' ||
      Number.isNaN(milestone.price),
  );

  if (invalidMilestone) {
    throw new Error('Each milestone must include a title and numeric price.');
  }

  const milestonesTotalPrice = milestones.reduce((sum, milestone) => sum + milestone.price, 0);
  if (milestonesTotalPrice !== totalPrice) {
    throw new Error('The sum of milestone prices must equal the total job price.');
  }

  const contractorProfile = await prisma.contractor.findUnique({
    where: { id: contractorId },
    include: { user: true },
  });
  if (!contractorProfile) {
    throw new Error('Contractor profile not found.');
  }

  const homeownerProfile = await prisma.homeowner.findUnique({
    where: { id: homeownerId },
    include: { user: true },
  });
  if (!homeownerProfile) {
    throw new Error('Homeowner profile not found.');
  }

  const basePlatformFeeBps =
    typeof data.platformFeeBps === 'number' ? data.platformFeeBps : appConfig.platformFeeBps;
  const platformFeeBps = resolvePlatformFeeBps(basePlatformFeeBps, contractorProfile.subscriptionTier);
  const stateCode = (requestedStateCode ?? homeownerProfile.state ?? 'TX').toUpperCase();

  if (!appConfig.allowedStates.includes(stateCode)) {
    throw new Error(`State ${stateCode} is not currently supported.`);
  }

  const stateRule = getStateRule(stateCode);
  const cappedPlatformFeeBps =
    stateRule.platformFeeCapBps !== null
      ? Math.min(platformFeeBps, stateRule.platformFeeCapBps)
      : platformFeeBps;
  const feeBreakdown = calculateFees(totalPrice, { platformFeeBps: cappedPlatformFeeBps });

  const job = await prisma.job.create({
    data: {
      title,
      description,
      totalPrice,
      contractorId,
      homeownerId,
      status: JobStatus.FUNDING_REQUIRED,
      platformFeeBps: cappedPlatformFeeBps,
      feeAmounts: feeBreakdown,
      stateCode,
      milestones: {
        create: milestones.map((milestone, index) => {
          const isFinalMilestone = index === milestones.length - 1;
          const reviewDays = isFinalMilestone
            ? stateRule.reviewWindows.finalMilestoneDays
            : stateRule.reviewWindows.midMilestoneDays;
          return {
            title: milestone.title,
            price: milestone.price,
            status: 'PENDING',
            reviewDeadlineAt: new Date(Date.now() + reviewDays * 24 * 60 * 60 * 1000),
          };
        }),
      },
    },
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
    },
  });

  const homeownerUser = homeownerProfile.user;
  const contractorUser = contractorProfile.user;
  const emailSubject = `New Job Created: ${job.title}`;
  const emailText = `Hello ${homeownerUser.email},\n\nContractor ${contractorUser.email} has created a new job for you: "${job.title}". Please log in to Conforma to review and fund the project.\n\nTotal Price: $${job.totalPrice}`;
  notifications.sendEmail(
    homeownerUser.email,
    emailSubject,
    emailText,
    `<p>${emailText.replace(/\n/g, '<br>')}</p>`,
  );

  if (homeownerProfile.phoneNumber) {
    const smsText = `Conforma: A new job "${job.title}" has been created for you. Please log in to review and fund the project.`;
    notifications.sendSms(homeownerProfile.phoneNumber, smsText);
  }

  const escrowTransaction = await escrow.createTransaction({
    title,
    description,
    totalPrice,
    homeowner: homeownerUser,
    contractor: contractorUser,
  });

  const updatedJob = await prisma.job.update({
    where: { id: job.id },
    data: { escrowTransactionId: escrowTransaction.id },
    include: {
      milestones: true,
      homeowner: { include: { user: true } },
      contractor: { include: { user: true } },
    },
  });

  return updatedJob;
};
export const refreshJobFees = async (jobId: string, stateCode: string, prisma: PrismaClient = prismaClient) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: { contractor: true },
  });

  if (!job || !job.contractor) {
    throw new Error('Job not found.');
  }

  const basePlatformFeeBps = resolvePlatformFeeBps(appConfig.platformFeeBps, job.contractor.subscriptionTier);
  const stateRule = getStateRule(stateCode);
  const cappedPlatformFeeBps =
    stateRule.platformFeeCapBps !== null
      ? Math.min(basePlatformFeeBps, stateRule.platformFeeCapBps)
      : basePlatformFeeBps;
  const feeBreakdown = calculateFees(job.totalPrice, { platformFeeBps: cappedPlatformFeeBps });

  return prisma.job.update({
    where: { id: jobId },
    data: {
      platformFeeBps: cappedPlatformFeeBps,
      feeAmounts: feeBreakdown,
      stateCode,
    },
  });
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



