import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

// --- Email Configuration ---
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const fromEmail = process.env.SENDGRID_FROM_EMAIL!;

// --- SMS Configuration ---
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER!;


/**
 * Sends an email using SendGrid.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param text - The plain text content of the email.
 * @param html - The HTML content of the email.
 */
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  const msg = { to, from: fromEmail, subject, text, html };
  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Sends an SMS using Twilio.
 * @param to - The recipient's phone number (must be in E.164 format, e.g., +15551234567).
 * @param body - The text of the message.
 */
export const sendSms = async (to: string, body: string) => {
  try {
    await twilioClient.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log(`SMS sent to ${to}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

type ListOptions = {
  page?: number;
  pageSize?: number;
  unreadOnly?: boolean;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

export const createInAppNotification = async (
  userId: string,
  type: string,
  payload: Prisma.InputJsonValue,
) => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        type,
        payload,
      },
    });
  } catch (error) {
    console.error('Error creating in-app notification:', error);
  }
};

export const listNotifications = async (userId: string, options: ListOptions = {}) => {
  const page = options.page && options.page > 0 ? options.page : DEFAULT_PAGE;
  const pageSize =
    options.pageSize && options.pageSize > 0 && options.pageSize <= 100
      ? options.pageSize
      : DEFAULT_PAGE_SIZE;

  const where = {
    userId,
    ...(options.unreadOnly ? { readAt: null } : {}),
  };

  const [total, notifications] = await prisma.$transaction([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    notifications,
  };
};

export const markNotificationsRead = async (userId: string, notificationIds?: string[]) => {
  if (notificationIds && notificationIds.length > 0) {
    await prisma.notification.updateMany({
      where: {
        userId,
        id: {
          in: notificationIds,
        },
      },
      data: {
        readAt: new Date(),
      },
    });
  } else {
    await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
};

export const getUnreadCount = async (userId: string) => {
  return prisma.notification.count({
    where: {
      userId,
      readAt: null,
    },
  });
};
