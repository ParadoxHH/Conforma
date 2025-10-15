import { Request, Response } from 'express';
import { InviteRole, Trade } from '@prisma/client';
import { z } from 'zod';
import * as inviteService from '../services/invite.service';

const zipRegex = /^[0-9]{5}$/;
const phoneRegex = /^\+1[0-9]{10}$/;

const createInviteSchema = z.object({
  role: z.nativeEnum(InviteRole),
  email: z.string().email(),
  phone: z.string().regex(phoneRegex).optional(),
  jobId: z.string().optional(),
});

const baseAcceptSchema = z.object({
  password: z.string().min(8).max(64),
});

const contractorAcceptSchema = baseAcceptSchema.extend({
  companyName: z.string().min(2).max(255),
  serviceAreas: z.array(z.string().regex(zipRegex)).min(1).max(50),
  trades: z.array(z.nativeEnum(Trade)).min(1).max(5),
});

const homeownerAcceptSchema = baseAcceptSchema.extend({
  displayName: z.string().min(2).max(120).optional(),
  address: z.string().min(3).max(255),
  city: z.string().min(2).max(120),
  state: z.string().length(2),
  zip: z.string().regex(zipRegex),
});

export const createInvite = async (req: Request, res: Response) => {
  try {
    const parsed = createInviteSchema.parse(req.body);
    const currentUser = req.user as { id: string; role: string };

    if (!currentUser) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const invite = await inviteService.createInvite({
      role: parsed.role,
      email: parsed.email,
      phone: parsed.phone,
      jobId: parsed.jobId,
      createdByUserId: currentUser.id,
    });

    await inviteService.expireStaleInvites(); // opportunistic clean-up

    return res.status(201).json({
      message: 'Invite created',
      invite: {
        id: invite.id,
        role: invite.role,
        email: invite.email,
        status: invite.status,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: 'Job not found' });
    }
    return res.status(500).json({ message: 'Failed to create invite', error: error.message });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await inviteService.getInviteByToken(token);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }

    let parsedBody: any;
    if (invite.role === InviteRole.CONTRACTOR) {
      parsedBody = contractorAcceptSchema.parse(req.body);
    } else {
      parsedBody = homeownerAcceptSchema.parse(req.body);
    }

    const result = await inviteService.acceptInvite({
      token,
      password: parsedBody.password,
      companyName: parsedBody.companyName,
      serviceAreas: parsedBody.serviceAreas,
      trades: parsedBody.trades,
      displayName: parsedBody.displayName,
      address: parsedBody.address,
      city: parsedBody.city,
      state: parsedBody.state,
      zip: parsedBody.zip,
    });

    return res.status(200).json({
      message: 'Invite accepted',
      ...result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Invite expired' || error.message === 'Invite already processed') {
      return res.status(410).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Failed to accept invite', error: error.message });
  }
};

export const getInvite = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invite = await inviteService.getInviteByToken(token);
    if (!invite) {
      return res.status(404).json({ message: 'Invite not found' });
    }
    const expired = invite.expiresAt.getTime() < Date.now();
    return res.status(200).json({
      id: invite.id,
      role: invite.role,
      email: invite.email,
      status: expired && invite.status === 'PENDING' ? 'EXPIRED' : invite.status,
      expiresAt: invite.expiresAt,
      hasJob: Boolean(invite.jobId),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load invite', error: error.message });
  }
};
