import { Request, Response } from 'express';
import { z } from 'zod';
import * as reviewService from '../services/review.service';

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).nullable().optional(),
});

const listQuerySchema = z.object({
  page: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, { message: 'page must be > 0' })
    .optional(),
  pageSize: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0 && value <= 50, {
      message: 'pageSize must be between 1 and 50',
    })
    .optional(),
});

export const createJobReview = async (req: Request, res: Response) => {
  try {
    const parsedBody = createReviewSchema.parse(req.body);
    const { id: userId, role } = req.user as { id: string; role: any };
    const { id: jobId } = req.params;

    const review = await reviewService.createReview(jobId, { id: userId, role }, parsedBody);
    return res.status(201).json({ message: 'Review created', review });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Only homeowners can review jobs') {
      return res.status(403).json({ message: error.message });
    }
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (error.message === 'Job not completed') {
      return res.status(409).json({ message: error.message });
    }
    if (error.message === 'Review already exists') {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

export const listContractorReviews = async (req: Request, res: Response) => {
  try {
    const parsedQuery = listQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({ message: 'Invalid parameters', errors: parsedQuery.error.issues });
    }
    const { id: contractorId } = req.params;
    const data = await reviewService.listContractorReviews(contractorId, parsedQuery.data);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load reviews', error: error.message });
  }
};
