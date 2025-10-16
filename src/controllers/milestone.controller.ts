import { Request, Response } from 'express';
import { MilestoneStatus, Role } from '@prisma/client';
import * as milestoneService from '../services/milestone.service';
import prisma from '../lib/prisma';

export const updateMilestoneStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(MilestoneStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid milestone status' });
    }

    const milestoneRecord = await prisma.milestone.findUnique({
      where: { id },
      include: {
        job: {
          include: {
            homeowner: true,
            contractor: true,
          },
        },
      },
    });

    if (!milestoneRecord) {
      return res.status(404).json({ message: 'Milestone not found' });
    }

    const { user: currentUser } = req as Request & { user?: { id?: string; role?: Role } };
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const isParticipant =
      milestoneRecord.job?.homeowner?.userId === currentUser.id ||
      milestoneRecord.job?.contractor?.userId === currentUser.id;

    if (currentUser.role !== Role.ADMIN && !isParticipant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const milestone = await milestoneService.updateMilestoneStatus(id, status, prisma);
    res.status(200).json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestone status' });
  }
};

export const submitMilestone = async (req: Request, res: Response) => {
  try {
    const { user: currentUser } = req as Request & { user?: { id?: string; role?: Role } };
    if (!currentUser?.id || !currentUser.role) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { id } = req.params;

    if (currentUser.role !== Role.CONTRACTOR) {
      return res.status(403).json({ message: 'Only contractors can submit milestones.' });
    }

    const milestone = await milestoneService.submitMilestone(id, currentUser.id, prisma);
    res.status(200).json(milestone);
  } catch (error: any) {
     if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error submitting milestone' });
  }
};
