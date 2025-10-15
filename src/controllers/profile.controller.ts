import { Request, Response } from 'express';
import { Role, Trade } from '@prisma/client';
import { z } from 'zod';
import * as profileService from '../services/profile.service';

const zipRegex = /^[0-9]{5}$/;

const portfolioItemSchema = z.object({
  title: z.string().max(120),
  url: z.string().url(),
  type: z.string().max(40),
});

const contractorUpdateSchema = z.object({
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().max(1000).nullable().optional(),
  companyName: z.string().max(255).nullable().optional(),
  serviceAreas: z
    .array(z.string().regex(zipRegex))
    .min(1)
    .max(50)
    .optional(),
  trades: z.array(z.nativeEnum(Trade)).min(1).max(5).optional(),
  portfolio: z.array(portfolioItemSchema).max(25).optional(),
});

const homeownerUpdateSchema = z.object({
  avatarUrl: z.string().url().nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  displayName: z.string().max(120).nullable().optional(),
  allowAlias: z.boolean().optional(),
});

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as { id: string };
    const profile = await profileService.getCurrentProfile(userId);
    return res.status(200).json(profile);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load profile', error: error.message });
  }
};

export const updateMyProfile = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user as { id: string; role: Role };
    if (role === Role.CONTRACTOR) {
      const parsed = contractorUpdateSchema.parse(req.body);
      const updated = await profileService.updateProfile(userId, role, parsed);
      return res.status(200).json({ message: 'Profile updated', contractor: updated });
    }

    if (role === Role.HOMEOWNER) {
      const parsed = homeownerUpdateSchema.parse(req.body);
      const updated = await profileService.updateProfile(userId, role, parsed);
      return res.status(200).json({ message: 'Profile updated', homeowner: updated });
    }

    return res.status(400).json({ message: 'Profile updates not available for this role' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

export const getContractorProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const profile = await profileService.getContractorPublicProfile(id);
    return res.status(200).json(profile);
  } catch (error: any) {
    if (error.message === 'Contractor not found') {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to load contractor profile', error: error.message });
  }
};
