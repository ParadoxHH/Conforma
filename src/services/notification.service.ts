import sgMail from '@sendgrid/mail';
import twilio from 'twilio';
import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { logger } from '../utils/logger';

// --- Email Configuration ---
const sendgridApiKey = process.env.SENDGRID_API_KEY;
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL;
const sendgridConfigured = Boolean(sendgridApiKey && sendgridFromEmail);

if (sendgridConfigured && sendgridApiKey) {
  try {
    sgMail.setApiKey(sendgridApiKey);
  } catch (error) {
    logger.error('Failed to configure SendGrid API key', error);
  }
} else {
  logger.warn('SendGrid credentials missing; email notifications are disabled');
}

// --- SMS Configuration ---
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioConfigured = Boolean(twilioAccountSid && twilioAuthToken && twilioPhoneNumber);

const twilioClient = twilioConfigured
  ? twilio(twilioAccountSid as string, twilioAuthToken as string)
  : null;

if (!twilioConfigured) {
  logger.warn('Twilio credentials missing; SMS notifications are disabled');
}


/**
 * Sends an email using SendGrid.
 * @param to - The recipient's email address.
 * @param subject - The subject of the email.
 * @param text - The plain text content of the email.
 * @param html - The HTML content of the email.
 */
export const sendEmail = async (to: string, subject: string, text: string, html: string) => {
  if (!sendgridConfigured || !sendgridFromEmail) {
    logger.warn(`Skipped sending email to ${to}: SendGrid is not configured`);
    return;
  }

  const msg = { to, from: sendgridFromEmail, subject, text, html };
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
  if (!twilioConfigured || !twilioClient || !twilioPhoneNumber) {
    logger.warn(`Skipped sending SMS to ${to}: Twilio is not configured`);
    return;
  }

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
