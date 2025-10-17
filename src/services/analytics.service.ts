import { PrismaClient, PayoutType, SubscriptionTier } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { ensureFeeBreakdown } from '../utils/fees';
import { subscriptionPlans } from '../config/app.config';

type DateRange = {
  from?: Date;
  to?: Date;
};

const normalizeRange = (range: DateRange) => {
  const to = range.to ?? new Date();
  const from = range.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
};

export const getContractorAnalytics = async (
  userId: string,
  range: DateRange,
  prisma: PrismaClient = prismaClient,
) => {
  const contractor = await prisma.contractor.findUnique({ where: { userId } });
  if (!contractor) {
    throw new Error('Contractor profile not found.');
  }

  const { from, to } = normalizeRange(range);

  const jobs = await prisma.job.findMany({
    where: {
      contractorId: contractor.id,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
  });

  const payouts = await prisma.payout.findMany({
    where: {
      contractorId: contractor.id,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      job: { select: { createdAt: true } },
    },
  });

  const disputes = await prisma.dispute.findMany({
    where: {
      milestone: {
        job: {
          contractorId: contractor.id,
          createdAt: { gte: from, lte: to },
        },
      },
    },
  });

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((job) => job.status === 'COMPLETED').length;
  const disputedJobs = jobs.filter((job) => job.status === 'DISPUTED').length;

  const revenueNetOfFees = jobs.reduce((sum, job) => {
    const feeBreakdown = ensureFeeBreakdown(job.feeAmounts);
    return sum + (job.totalPrice - feeBreakdown.totalFees);
  }, 0);

  const avgPayoutDays = payouts.length
    ? payouts.reduce((total, payout) => {
        const jobCreatedAt = payout.job?.createdAt ?? payout.createdAt;
        const diffMs = payout.createdAt.getTime() - jobCreatedAt.getTime();
        return total + diffMs / (1000 * 60 * 60 * 24);
      }, 0) / payouts.length
    : 0;

  const instantPayouts = payouts.filter((payout) => payout.type === PayoutType.INSTANT).length;

  return {
    jobsWonPercentage: totalJobs ? completedJobs / totalJobs : 0,
    disputesRate: totalJobs ? disputedJobs / totalJobs : 0,
    averagePayoutDays: avgPayoutDays,
    revenueNetOfFees,
    instantPayoutUsage: payouts.length ? instantPayouts / payouts.length : 0,
    totals: {
      totalJobs,
      completedJobs,
      disputedJobs,
      payouts: payouts.length,
    },
  };
};

export const getHomeownerAnalytics = async (
  userId: string,
  range: DateRange,
  prisma: PrismaClient = prismaClient,
) => {
  const homeowner = await prisma.homeowner.findUnique({ where: { userId } });
  if (!homeowner) {
    throw new Error('Homeowner profile not found.');
  }

  const { from, to } = normalizeRange(range);

  const jobs = await prisma.job.findMany({
    where: {
      homeownerId: homeowner.id,
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      milestones: true,
    },
  });

  const totalSpend = jobs.reduce((sum, job) => sum + job.totalPrice, 0);
  const completedJobs = jobs.filter((job) => job.status === 'COMPLETED');
  const averageCompletionDays = completedJobs.length
    ? completedJobs.reduce((total, job) => {
        const diffMs = job.updatedAt.getTime() - job.createdAt.getTime();
        return total + diffMs / (1000 * 60 * 60 * 24);
      }, 0) / completedJobs.length
    : 0;

  const milestones = jobs.flatMap((job) => job.milestones);
  const approvedMilestones = milestones.filter((m) => m.status === 'RELEASED').length;
  const disputedMilestones = milestones.filter((m) => m.status === 'DISPUTED').length;
  const totalMilestones = milestones.length || 1;

  return {
    totalSpend,
    averageCompletionDays,
    approvalRate: approvedMilestones / totalMilestones,
    disputeRate: disputedMilestones / totalMilestones,
    totals: {
      jobs: jobs.length,
      milestones: milestones.length,
      approvedMilestones,
      disputedMilestones,
    },
  };
};

export const getAdminAnalytics = async (range: DateRange, prisma: PrismaClient = prismaClient) => {
  const { from, to } = normalizeRange(range);

  const contractors = await prisma.contractor.findMany({});
  const jobs = await prisma.job.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
  });
  const disputes = await prisma.dispute.findMany({
    where: {
      createdAt: { gte: from, lte: to },
    },
  });

  const activeContractors = contractors.filter((contractor) => contractor.subscriptionStatus === 'ACTIVE');
  const churnedContractors = contractors.filter((contractor) => contractor.subscriptionStatus === 'CANCELED');

  const planPrices = new Map<SubscriptionTier, number>();
  subscriptionPlans.forEach((plan) => planPrices.set(plan.tier, plan.priceMonthly));

  const mrr = activeContractors.reduce((sum, contractor) => {
    const planPrice = planPrices.get(contractor.subscriptionTier) ?? 0;
    return sum + planPrice;
  }, 0);

  const feeRevenue = jobs.reduce((sum, job) => {
    const fees = ensureFeeBreakdown(job.feeAmounts);
    return sum + fees.platformFee;
  }, 0);

  const instantPayoutRevenue = jobs.reduce((sum, job) => {
    const fees = ensureFeeBreakdown(job.feeAmounts);
    return sum + fees.instantPayoutFee;
  }, 0);

  const disputeSlaHours = disputes.length
    ? disputes.reduce((total, dispute) => {
        const resolvedAt = dispute.updatedAt ?? dispute.createdAt;
        const diffMs = resolvedAt.getTime() - dispute.createdAt.getTime();
        return total + diffMs / (1000 * 60 * 60);
      }, 0) / disputes.length
    : 0;

  return {
    mrr,
    churnRate: contractors.length ? churnedContractors.length / contractors.length : 0,
    arpu: activeContractors.length ? mrr / activeContractors.length : 0,
    feeRevenue,
    instantPayoutRevenue,
    disputeSlaHours,
    totals: {
      activeContractors: activeContractors.length,
      churnedContractors: churnedContractors.length,
      jobs: jobs.length,
      disputes: disputes.length,
    },
  };
};
