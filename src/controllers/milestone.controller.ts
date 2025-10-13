import { Request, Response } from 'express';
import * as milestoneService from '../services/milestone.service';
import { MilestoneStatus } from '@prisma/client';

export const updateMilestoneStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Add validation to ensure status is a valid MilestoneStatus enum value
    if (!Object.values(MilestoneStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid milestone status' });
    }

    // Add authorization logic here to ensure only allowed users can update
    // For example, only a homeowner can approve (set to FUNDED or RELEASED)
    // and only a contractor can submit (set to another status)

    const milestone = await milestoneService.updateMilestoneStatus(id, status);
    res.status(200).json(milestone);
  } catch (error) {
    res.status(500).json({ message: 'Error updating milestone status' });
  }
};
