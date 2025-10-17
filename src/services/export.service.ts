import { PrismaClient } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { ensureFeeBreakdown } from '../utils/fees';

type DateRange = {
  from?: Date;
  to?: Date;
};

const normalizeRange = (range: DateRange) => {
  const to = range.to ?? new Date();
  const from = range.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to };
};

const formatCurrency = (cents: number) => (cents / 100).toFixed(2);

export const generateAccountingCsv = async (
  range: DateRange,
  prisma: PrismaClient = prismaClient,
) => {
  const { from, to } = normalizeRange(range);

  const payouts = await prisma.payout.findMany({
    where: {
      createdAt: {
        gte: from,
        lte: to,
      },
    },
    include: {
      contractor: {
        include: {
          user: true,
        },
      },
      job: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const headers = [
    'date',
    'jobId',
    'contractorId',
    'contractorEmail',
    'amountCents',
    'amountUSD',
    'type',
    'status',
    'platformFeeUSD',
    'escrowFeesUSD',
    'instantPayoutFeeUSD',
  ];

  const lines = payouts.map((payout) => {
    const feeBreakdown = ensureFeeBreakdown(payout.job?.feeAmounts);
    const amountUsd = formatCurrency(payout.amount);
    return [
      payout.createdAt.toISOString(),
      payout.jobId,
      payout.contractorId,
      payout.contractor?.user?.email ?? '',
      payout.amount,
      amountUsd,
      payout.type,
      payout.status,
      feeBreakdown.platformFee.toFixed(2),
      feeBreakdown.escrowFees.toFixed(2),
      feeBreakdown.instantPayoutFee.toFixed(2),
    ].join(',');
  });

  return [headers.join(','), ...lines].join('\n');
};
