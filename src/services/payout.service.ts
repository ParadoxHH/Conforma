import { PrismaClient, PayoutStatus, PayoutType, Role } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { appConfig } from '../config/app.config';
import { calculateFees, ensureFeeBreakdown } from '../utils/fees';
import { recordFirstFundedJob } from './referral.service';

type ListFilters = {
  status?: PayoutStatus;
  from?: Date;
  to?: Date;
};

export const createInstantPayout = async (
  jobId: string,
  userId: string,
  prisma: PrismaClient = prismaClient,
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      contractor: true,
    },
  });

  if (!job) {
    throw new Error('Job not found.');
  }

  const contractor = await prisma.contractor.findUnique({
    where: { id: job.contractorId },
    include: { user: true },
  });

  if (!contractor || contractor.userId !== userId) {
    throw new Error('You are not authorized to request payouts for this job.');
  }

  if (!contractor.instantPayoutEnabled || !appConfig.instantPayoutEnabled) {
    throw new Error('Instant payout is not enabled for this contractor.');
  }

  const newFeeBreakdown = calculateFees(job.totalPrice, {
    platformFeeBps: job.platformFeeBps,
    applyInstantPayout: true,
  });

  const amountCents = Math.max(0, Math.round(newFeeBreakdown.netPayout * 100));

  const payout = await prisma.payout.create({
    data: {
      jobId: job.id,
      contractorId: contractor.id,
      amount: amountCents,
      type: PayoutType.INSTANT,
      status: PayoutStatus.PENDING,
      metadata: {
        calculatedAt: new Date().toISOString(),
        netPayout: newFeeBreakdown.netPayout,
        totalFees: newFeeBreakdown.totalFees,
      },
    },
  });

  await prisma.job.update({
    where: { id: job.id },
    data: {
      feeAmounts: newFeeBreakdown,
    },
  });

  return payout;
};

export const listPayouts = async (
  userId: string,
  role: Role,
  filters: ListFilters,
  prisma: PrismaClient = prismaClient,
) => {
  if (role !== Role.CONTRACTOR) {
    throw new Error('Only contractors can view payout history.');
  }

  const contractor = await prisma.contractor.findUnique({
    where: { userId },
  });

  if (!contractor) {
    throw new Error('Contractor profile not found.');
  }

  return prisma.payout.findMany({
    where: {
      contractorId: contractor.id,
      status: filters.status,
      createdAt: {
        gte: filters.from,
        lte: filters.to,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getJobFees = async (
  jobId: string,
  userId: string,
  role: Role,
  prisma: PrismaClient = prismaClient,
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      contractor: true,
      homeowner: true,
    },
  });

  if (!job) {
    throw new Error('Job not found.');
  }

  if (role !== Role.ADMIN) {
    if (
      (role === Role.CONTRACTOR && job.contractor?.userId !== userId) ||
      (role === Role.HOMEOWNER && job.homeowner?.userId !== userId)
    ) {
      throw new Error('You are not authorized to view this fee breakdown.');
    }
  }

  return ensureFeeBreakdown(job.feeAmounts);
};

