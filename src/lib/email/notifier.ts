import { autonomyConfig } from '../../config/autonomy';
import { logger } from '../../utils/logger';
import { EmailProvider, EmailPayload } from './provider';
import { createResendProvider } from './resendProvider';
import { emailTemplates, EmailEvent, TemplateDataMap } from './templates';

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
const EMAIL_SENDER = process.env.EMAIL_SENDER ?? 'Conforma <no-reply@conforma.app>';

const backoffDelays = [0, 5_000, 30_000];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const createProvider = (): EmailProvider => {
  if (RESEND_API_KEY) {
    return createResendProvider(RESEND_API_KEY, EMAIL_SENDER);
  }

  logger.warn('RESEND_API_KEY missing; emails will be logged only.');
  return {
    async sendEmail(payload: EmailPayload) {
      logger.info('Email (dry-run)', {
        to: payload.to,
        subject: payload.subject,
      });
    },
  };
};

const provider = createProvider();

export const notify = async <T extends EmailEvent>(
  event: T,
  data: TemplateDataMap[T],
) => {
  if (!autonomyConfig.autonomyEnabled || !autonomyConfig.emailsEnabled) {
    logger.debug('Email suppressed by autonomy flags', { event });
    return;
  }

  const template = emailTemplates[event];
  if (!template) {
    logger.warn('No email template registered for event', { event });
    return;
  }

  const payload = template(data);

  for (let attempt = 0; attempt < backoffDelays.length; attempt += 1) {
    const delayMs = backoffDelays[attempt];
    if (delayMs > 0) {
      await delay(delayMs);
    }

    try {
      await provider.sendEmail(payload);
      logger.info('Email sent', { event, to: payload.to, attempt });
      return;
    } catch (error) {
      logger.error('Email send failed', {
        event,
        to: payload.to,
        attempt,
        error: (error as Error).message,
      });
      if (attempt === backoffDelays.length - 1) {
        throw error;
      }
    }
  }
};

export type { EmailEvent } from './templates';
export type { TemplateDataMap } from './templates';
