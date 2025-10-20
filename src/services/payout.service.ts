import { metrics, trace, SpanStatusCode } from '@opentelemetry/api';
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

const payoutTracer = trace.getTracer('conforma.payouts');
const payoutMeter = metrics.getMeter('conforma.payouts');
const payoutCounter = payoutMeter.createCounter('payouts_created_total', {
  description: 'Instant payouts requested by contractors',
});

export const createInstantPayout = async (
  jobId: string,
  userId: string,
  prisma: PrismaClient = prismaClient,
): Promise<any> => {
  return payoutTracer.startActiveSpan('payout.instant', async (span) => {
    span.setAttribute('job.id', jobId);
    try {
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

      span.setAttribute('contractor.id', contractor.id);

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

      payoutCounter.add(1, {
        contractor_id: contractor.id,
        payout_type: 'INSTANT',
      });

      await prisma.job.update({
        where: { id: job.id },
        data: {
          feeAmounts: newFeeBreakdown,
        },
      });

      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute('payout.amount_cents', amountCents);
      return payout;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
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

