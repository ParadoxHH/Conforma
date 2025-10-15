import { Request, Response } from 'express';
import { z } from 'zod';
import * as notificationService from '../services/notification.service';

const listQuerySchema = z.object({
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
  unreadOnly: z
    .string()
    .transform((value) => value === 'true')
    .optional(),
});

const markReadSchema = z.object({
  ids: z.array(z.string()).optional(),
});

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid parameters', errors: parsed.error.issues });
    }
    const { id: userId } = req.user as { id: string };
    const notifications = await notificationService.listNotifications(userId, parsed.data);
    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load notifications', error: error.message });
  }
};

export const markNotificationsRead = async (req: Request, res: Response) => {
  try {
    const parsed = markReadSchema.parse(req.body);
    const { id: userId } = req.user as { id: string };
    await notificationService.markNotificationsRead(userId, parsed.ids);
    return res.status(200).json({ message: 'Notifications marked as read' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.issues });
    }
    return res.status(500).json({ message: 'Failed to update notifications', error: error.message });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user as { id: string };
    const count = await notificationService.getUnreadCount(userId);
    return res.status(200).json({ unread: count });
  } catch (error: any) {
    return res.status(500).json({ message: 'Failed to load unread count', error: error.message });
  }
};
