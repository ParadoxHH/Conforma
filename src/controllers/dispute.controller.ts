import { Request, Response } from 'express';
import * as disputeService from '../services/dispute.service';
import prisma from '../lib/prisma';
import * as notificationService from '../services/notification.service';

export const createDispute = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id: userId, role } = req.user;
    const { milestoneId } = req.params;
    const { reason } = req.body;

    if (role !== 'HOMEOWNER') {
      return res.status(403).json({ message: 'Only homeowners can create disputes.' });
    }

    const dispute = await disputeService.createDispute(milestoneId, reason, userId, prisma, notificationService);
    res.status(201).json(dispute);
  } catch (error: any) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error creating dispute', error: error.message });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { role } = req.user;
    const { disputeId } = req.params;
    const { resolutionNotes } = req.body;

    if (role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can resolve disputes.' });
    }

    const dispute = await disputeService.resolveDispute(disputeId, resolutionNotes, prisma);
    res.status(200).json(dispute);
  } catch (error: any) {
    res.status(500).json({ message: 'Error resolving dispute', error: error.message });
  }
};
export const getDispute = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const currentUser = req.user as { id: string; role: string } | undefined;
    const { disputeId } = req.params;

    const dispute = await prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        milestone: {
          include: {
            job: {
              include: {
                homeowner: { include: { user: true } },
                contractor: { include: { user: true } },
              },
            },
            evidence: true,
          },
        },
      },
    });

    if (!dispute) {
      return res.status(404).json({ message: 'Dispute not found' });
    }

    if (currentUser && currentUser.role !== 'ADMIN') {
      const homeownerId = dispute.milestone.job.homeowner.userId;
      const contractorId = dispute.milestone.job.contractor.userId;
      if (currentUser.id !== homeownerId && currentUser.id !== contractorId) {
        return res.status(403).json({ message: 'Unauthorized' });
      }
    }

    res.status(200).json(dispute);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dispute', error: (error as Error).message });
  }
};
