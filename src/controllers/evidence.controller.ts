import { Request, Response } from 'express';
import { z } from 'zod';
import * as evidenceService from '../services/evidence.service';

const uploadUrlSchema = z.object({
  milestoneId: z.string().min(1),
  mimeType: z.string().min(3).max(128).optional(),
});

const createEvidenceSchema = z.object({
  milestoneId: z.string().min(1),
  fileUrl: z.string().url(),
  type: z.string().min(1).max(64),
  contentHash: z.string().min(8).max(256).optional(),
});

export const requestUploadUrl = async (req: Request, res: Response) => {
  try {
    const parsed = uploadUrlSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    const payload = await evidenceService.createEvidenceUploadUrl(
      userId,
      parsed.milestoneId,
      parsed.mimeType,
    );
    return res.status(200).json(payload);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Milestone not found' || error.message === 'Job not found for milestone') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to generate upload url', error: error.message });
  }
};

export const createEvidence = async (req: Request, res: Response) => {
  try {
    const parsed = createEvidenceSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    const result = await evidenceService.recordEvidence(userId, parsed);
    const status = result.duplicate ? 200 : 201;
    return res.status(status).json({ evidence: result.evidence, duplicate: result.duplicate });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Milestone not found' || error.message === 'Job not found for milestone') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to record evidence', error: error.message });
  }
};

export const listEvidence = async (req: Request, res: Response) => {
  try {
    const { milestoneId } = req.params;
    const { id: userId } = req.user as { id: string };
    const evidence = await evidenceService.listEvidenceForMilestone(userId, milestoneId);
    return res.status(200).json({ evidence });
  } catch (error: any) {
    if (error.message === 'Milestone not found' || error.message === 'Job not found for milestone') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'User not found') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to load evidence', error: error.message });
  }
};
