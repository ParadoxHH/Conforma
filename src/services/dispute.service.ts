import { PrismaClient } from '@prisma/client';
import * as notificationService from './notification.service';
import prismaClient from '../lib/prisma';

export const createDispute = async (
  milestoneId: string, 
  reason: string, 
  userId: string,
  prisma: PrismaClient = prismaClient,
  notifications: typeof notificationService = notificationService
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
  const adminEmail = 'admin@conforma.com';
  const subject = `Dispute Opened for Job: ${milestone.job.title}`;
  const text = `A dispute has been opened by ${milestone.job.homeowner.user.email} for milestone "${milestone.title}".\n\nReason: ${reason}\n\nPlease log in to Conforma to review the details.`;
  
  notifications.sendEmail(contractorEmail, subject, text, `<p>${text.replace(/\n/g, '<br>')}</p>`);
  notifications.sendEmail(adminEmail, subject, text, `<p>${text.replace(/\n/g, '<br>')}</p>`);

  return dispute;
};

export const resolveDispute = async (disputeId: string, resolutionNotes: string, prisma: PrismaClient = prismaClient) => {
  const dispute = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'RESOLVED',
      resolutionNotes,
    },
    include: {
      milestone: true,
    },
  });

  return dispute;
};
