import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const handleEscrowWebhook = async (req: Request, res: Response) => {
  const { event, data } = req.body;

  // Log the webhook for debugging
  await prisma.webhookEvent.create({
    data: {
      source: 'escrow.com',
      payload: req.body,
    },
  });

  try {
    if (event === 'transaction.updated') {
      const { id: transactionId, status: transactionStatus } = data;

      // Find the job associated with this transaction
      const job = await prisma.job.findFirst({
        where: { escrowTransactionId: transactionId },
      });

      if (job) {
        // Update job status based on escrow status
        let newJobStatus = job.status;
        if (transactionStatus === 'funded') {
          newJobStatus = 'IN_PROGRESS';
        } else if (transactionStatus === 'accepted' || transactionStatus === 'shipped') {
          // Could map to other statuses if needed
        } else if (transactionStatus === 'cancelled') {
          newJobStatus = 'DISPUTED'; // Or a new 'CANCELLED' status
        }

        if (newJobStatus !== job.status) {
          await prisma.job.update({
            where: { id: job.id },
            data: { status: newJobStatus },
          });
          console.log(`Updated job ${job.id} to status ${newJobStatus}`);
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing Escrow.com webhook:', error);
    res.status(500).send('Error processing webhook');
  }
};
