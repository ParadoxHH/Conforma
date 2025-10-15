import { Request, Response } from 'express';
import { Role } from '@prisma/client';
import { z } from 'zod';
import * as messageService from '../services/message.service';

const attachmentSchema = z.object({
  url: z.string().url(),
  type: z.string().max(40),
});

const createMessageSchema = z.object({
  body: z.string().trim().min(1).max(4000),
  attachments: z.array(attachmentSchema).max(5).optional(),
});

export const listMessages = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user as { id: string; role: Role };
    const { id: jobId } = req.params;
    const messages = await messageService.listMessages(jobId, { id: userId, role });
    return res.status(200).json(messages);
  } catch (error: any) {
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to load messages', error: error.message });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const parsed = createMessageSchema.parse(req.body);
    const { id: userId, role } = req.user as { id: string; role: Role };
    const { id: jobId } = req.params;

    const message = await messageService.createMessage(jobId, { id: userId, role }, parsed);
    return res.status(201).json(message);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to create message', error: error.message });
  }
};

export const markMessagesRead = async (req: Request, res: Response) => {
  try {
    const { id: userId, role } = req.user as { id: string; role: Role };
    const { id: jobId } = req.params;
    const count = await messageService.markMessagesRead(jobId, { id: userId, role });
    return res.status(200).json({ message: 'Messages marked as read', count });
  } catch (error: any) {
    if (error.message === 'Job not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Forbidden') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
  }
};
