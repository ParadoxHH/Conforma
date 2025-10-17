import type { PrismaClient } from '@prisma/client';
import prismaClient from '../lib/prisma';

const generateCode = async (prisma: PrismaClient, prefix: string) => {
  let attempts = 0;
  while (attempts < 5) {
    const candidate = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const existing = await prisma.user.findFirst({ where: { referralCode: candidate } });
    if (!existing) {
      return candidate;
    }
    attempts += 1;
  }
  throw new Error('Unable to generate unique referral code.');
};

export const ensureReferralCode = async (userId: string, prisma: PrismaClient = prismaClient) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found.');
  }

  if (user.referralCode) {
    return user.referralCode;
  }

  const code = await generateCode(prisma, 'REF');
  await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });
  return code;
};

export const getReferralSummary = async (userId: string, prisma: PrismaClient = prismaClient) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('User not found.');
  }

  const code = user.referralCode ?? (await ensureReferralCode(userId, prisma));

  const events = await prisma.referralEvent.findMany({
    where: { referrerUserId: userId },
  });

  const signups = events.filter((event) => event.event === 'SIGNED_UP').length;
  const firstFundedJobs = events.filter((event) => event.event === 'FIRST_FUNDED_JOB').length;
  const creditsRedeemed = events.filter((event) => event.event === 'CREDIT_REDEEMED').length;
  const credits = Math.max(firstFundedJobs - creditsRedeemed, 0);

  return {
    code,
    referredByCode: user.referredByCode,
    stats: {
      signups,
      firstFundedJobs,
      credits,
    },
  };
};

export const redeemReferralCode = async (
  userId: string,
  code: string,
  prisma: PrismaClient = prismaClient,
) => {
  const normalized = code.trim().toUpperCase();

  const [user, referrer] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { referralCode: normalized } }),
  ]);

  if (!user) {
    throw new Error('User not found.');
  }
  if (!referrer) {
    throw new Error('Referral code not recognized.');
  }
  if (referrer.id === user.id) {
    throw new Error('You cannot redeem your own referral code.');
  }
  if (user.referredByCode) {
    throw new Error('Referral code already applied.');
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { referredByCode: normalized },
    });

    const existing = await tx.referralEvent.findFirst({
      where: {
        referrerUserId: referrer.id,
        referredUserId: null,
        event: 'SIGNED_UP',
      },
    });

    if (!existing) {
      await tx.referralEvent.create({
        data: {
          referrerUserId: referrer.id,
          referredUserId: null,
          event: 'SIGNED_UP',
        },
      });
    }
  });

  return getReferralSummary(referrer.id, prisma);
};

export const recordFirstFundedJob = async (jobId: string, prisma: PrismaClient = prismaClient) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      homeowner: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!job?.homeowner?.user?.referredByCode) {
    return;
  }

  const referrer = await prisma.user.findUnique({
    where: { referralCode: job.homeowner.user.referredByCode },
  });

  if (!referrer) {
    return;
  }

  const existing = await prisma.referralEvent.findFirst({
    where: {
      referrerUserId: referrer.id,
      referredUserId: job.homeowner.userId,
      event: 'FIRST_FUNDED_JOB',
    },
  });

  if (existing) {
    return;
  }

  await prisma.referralEvent.create({
    data: {
      referrerUserId: referrer.id,
      referredUserId: job.homeowner.userId,
      event: 'FIRST_FUNDED_JOB',
    },
  });
};

export const redeemReferralCredit = async (userId: string, prisma: PrismaClient = prismaClient) => {
  const summary = await getReferralSummary(userId, prisma);
  if (summary.stats.credits <= 0) {
    throw new Error('No referral credits available.');
  }

  await prisma.referralEvent.create({
    data: {
      referrerUserId: userId,
      referredUserId: null,
      event: 'CREDIT_REDEEMED',
    },
  });

  return summary.stats.credits - 1;
};







