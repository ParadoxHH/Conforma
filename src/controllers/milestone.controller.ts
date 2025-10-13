import { Request, Response } from 'express';
import * as milestoneService from '../services/milestone.service';
import { MilestoneStatus } from '@prisma/client';

export const updateMilestoneStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(MilestoneStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid milestone status' });
    }

    const milestone = await milestoneService.updateMilestoneStatus(id, status);
    res.status(200).json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestone status' });
  }
};

export const submitMilestone = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id: userId, role } = req.user;
    const { id } = req.params;

    if (role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Only contractors can submit milestones.' });
    }

    const milestone = await milestoneService.submitMilestone(id, userId);
    res.status(200).json(milestone);
  } catch (error: any) {
     if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error submitting milestone' });
  }
};