import { PrismaClient } from '@prisma/client';
import * as notificationService from './notification.service';

const prisma = new PrismaClient();

export const createDispute = async (milestoneId: string, reason: string, userId: string) => {
  // Verify the user is the homeowner for this job
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

  // Create the dispute and update milestone status
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

  // Send notifications
  const contractorEmail = milestone.job.contractor.user.email;
  const adminEmail = 'admin@conforma.com'; // In a real app, this would be fetched from the DB
  const subject = `Dispute Opened for Job: ${milestone.job.title}`;
  const text = `A dispute has been opened by ${milestone.job.homeowner.user.email} for milestone "${milestone.title}".\n\nReason: ${reason}\n\nPlease log in to Conforma to review the details.`;
  
  notificationService.sendEmail(contractorEmail, subject, text, `<p>${text.replace(/\n/g, '<br>')}</p>`);
  notificationService.sendEmail(adminEmail, subject, text, `<p>${text.replace(/\n/g, '<br>')}</p>`);


  return dispute;
};

export const resolveDispute = async (disputeId: string, resolutionNotes: string) => {
  // In a real app, this would involve more complex logic,
  // like partial payments, refunds, etc.
  // For now, we'll just mark it as resolved.

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

  // Potentially update the milestone and job status back to IN_PROGRESS
  // depending on the resolution. Leaving as DISPUTED for now.

  return dispute;
};
