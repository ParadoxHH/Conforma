import { Request, Response } from 'express';
import { z } from 'zod';
import * as searchService from '../services/search.service';

const searchQuerySchema = z.object({
  trade: z.string().optional(),
  zip: z.string().regex(/^[0-9]{5}$/).optional(),
  radius: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && value >= 0, { message: 'radius must be a positive number' })
    .optional(),
  verified: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
  minRating: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => !Number.isNaN(value) && value >= 0 && value <= 5, {
      message: 'minRating must be between 0 and 5',
    })
    .optional(),
  q: z.string().optional(),
  page: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0, { message: 'page must be > 0' })
    .optional(),
  pageSize: z
    .string()
    .transform((value) => Number(value))
    .refine((value) => Number.isInteger(value) && value > 0 && value <= 100, {
      message: 'pageSize must be between 1 and 100',
    })
    .optional(),
  sort: z.enum(['rating', 'distance', 'recency']).optional(),
});

export const searchContractors = async (req: Request, res: Response) => {
  try {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid search parameters', errors: parsed.error.issues });
    }

    const params = parsed.data;
    const result = await searchService.searchContractors({
      trade: params.trade,
      zip: params.zip,
      radius: params.radius,
      verified: params.verified,
      minRating: params.minRating,
      q: params.q,
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ message: 'Contractor search failed', error: error.message });
  }
};
