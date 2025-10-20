import { PrismaClient } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { notify } from '../lib/email/notifier';

export const createDispute = async (
  milestoneId: string,
  reason: string,
  userId: string,
  prisma: PrismaClient = prismaClient,
) => {
  const milestone = await prisma.milestone.findUnique({
    where: { id: milestoneId },
    include: {
      job: {
        include: {
          homeowner: { include: { user: true } },
          contractor: { include: { user: true } },
        },
      },
    },
  });

  if (!milestone || milestone.job.homeowner.userId !== userId) {
    throw new Error('Unauthorized or milestone not found.');
  }

  const dispute = await prisma.dispute.create({
    data: {
      milestoneId,
      reasonText: reason,
      status: 'OPEN',
    },
  });

  await prisma.milestone.update({
    where: { id: milestoneId },
    data: { status: 'DISPUTED' },
  });

  await prisma.job.update({
    where: { id: milestone.jobId },
    data: { status: 'DISPUTED' },
  });

  const contractorEmail = milestone.job.contractor.user.email;
  const jobTitle = milestone.job.title;
  const milestoneTitle = milestone.title;

  notify('dispute_opened', {
    to: contractorEmail,
    jobTitle,
    milestoneTitle,
    reason,
  }).catch((error) => {
    console.error('Failed to send contractor dispute email', error);
  });

  const founderEmail = process.env.FOUNDER_ALERT_EMAIL ?? '';
  if (founderEmail) {
    notify('dispute_opened', {
      to: founderEmail,
      jobTitle,
      milestoneTitle,
      reason,
    }).catch((error) => {
      console.error('Failed to send founder dispute alert', error);
    });
  }

  return dispute;
};

export const resolveDispute = async (
  disputeId: string,
  resolutionNotes: string,
  prisma: PrismaClient = prismaClient,
) => {
  const dispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolutionNotes,
    },
    include: {
      milestone: {
        include: {
          job: {
            include: {
              homeowner: { include: { user: true } },
              contractor: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  const jobTitle = dispute.milestone.job.title;
  const milestoneTitle = dispute.milestone.title;
  const recipients = new Set<string>();
  const homeownerEmail = dispute.milestone.job.homeowner?.user?.email;
  const contractorEmail = dispute.milestone.job.contractor?.user?.email;

  if (homeownerEmail) {
    recipients.add(homeownerEmail.toLowerCase());
  }
  if (contractorEmail) {
    recipients.add(contractorEmail.toLowerCase());
  }

  for (const to of recipients) {
    notify('dispute_resolved', {
      to,
      jobTitle,
      milestoneTitle,
      resolution: resolutionNotes,
    }).catch((error) => {
      console.error('Failed to send dispute resolved email', error);
    });
  }

  return dispute;
};

