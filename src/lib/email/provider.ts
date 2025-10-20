export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export interface EmailProvider {
  sendEmail(payload: EmailPayload): Promise<void>;
}
