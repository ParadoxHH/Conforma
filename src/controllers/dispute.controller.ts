import { Request, Response } from 'express';
import * as disputeService from '../services/dispute.service';

export const createDispute = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const { id: userId, role } = req.user;
    const { milestoneId } = req.params;
    const { reason } = req.body;

    if (role !== 'HOMEOWNER') {
      return res.status(403).json({ message: 'Only homeowners can create disputes.' });
    }

    const dispute = await disputeService.createDispute(milestoneId, reason, userId);
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

    const dispute = await disputeService.resolveDispute(disputeId, resolutionNotes);
    res.status(200).json(dispute);
  } catch (error: any) {
    res.status(500).json({ message: 'Error resolving dispute', error: error.message });
  }
};
