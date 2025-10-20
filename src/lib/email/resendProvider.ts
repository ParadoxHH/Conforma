import { EmailPayload, EmailProvider } from './provider';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export const createResendProvider = (apiKey: string, sender: string): EmailProvider => {
  return {
    async sendEmail(payload: EmailPayload) {
      const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: sender,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API error ${response.status}: ${body}`);
      }
    },
  };
};
