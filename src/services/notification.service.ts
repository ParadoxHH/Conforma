import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

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
