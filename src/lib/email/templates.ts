import { EmailPayload } from './provider';

export type EmailEvent =
  | 'user_registered_contractor'
  | 'user_registered_homeowner'
  | 'invite_sent'
  | 'invite_accepted'
  | 'escrow_funded'
  | 'milestone_submitted'
  | 'milestone_reminder_24h'
  | 'milestone_approved'
  | 'milestone_auto_approved'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'document_approved'
  | 'document_rejected'
  | 'document_needs_review'
  | 'document_expiring_soon'
  | 'payout_initiated'
  | 'payout_settled'
  | 'weekly_founder_digest'
  | 'risk_review_required'
  | 'funding_blocked_alert'
  | 'webhook_failure_alert';

export type TemplateDataMap = {
  user_registered_contractor: { to: string; name?: string };
  user_registered_homeowner: { to: string; name?: string };
  invite_sent: { to: string; inviterName?: string; jobTitle?: string; acceptUrl: string };
  invite_accepted: { to: string; inviteeEmail: string; jobTitle?: string };
  escrow_funded: { to: string; jobTitle: string; amount: number; currency?: string };
  milestone_submitted: { to: string; jobTitle: string; milestoneTitle: string };
  milestone_reminder_24h: { to: string; jobTitle: string; milestoneTitle: string; dueAt: Date };
  milestone_approved: { to: string; jobTitle: string; milestoneTitle: string };
  milestone_auto_approved: { to: string; jobTitle: string; milestoneTitle: string };
  dispute_opened: { to: string; jobTitle: string; milestoneTitle: string; reason: string };
  dispute_resolved: { to: string; jobTitle: string; milestoneTitle: string; resolution: string };
  document_approved: { to: string; type: string };
  document_rejected: { to: string; type: string; reason?: string };
  document_needs_review: { to: string; type: string; reason?: string };
  document_expiring_soon: { to: string; type: string; effectiveTo: Date };
  payout_initiated: { to: string; amount: number; currency?: string };
  payout_settled: { to: string; amount: number; currency?: string };
  weekly_founder_digest: {
    to: string;
    windowStart: Date;
    windowEnd: Date;
    metrics: {
      newSignups: number;
      fundedJobs: number;
      avgPayoutLatencyHours: number;
      disputesOpened: number;
      disputesResolved: number;
      verificationApprovals: number;
      riskFlags: number;
    };
  };
  risk_review_required: { to: string; jobTitle: string; reasons: string[]; score: number };
  funding_blocked_alert: { to: string; jobTitle: string; reasons: string[]; score: number };
  webhook_failure_alert: { to: string; source: string; error: string };
};

const formatCurrency = (amount: number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (date: Date) =>
  date.toLocaleString('en-US', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });

const createTemplate = <T>(
  subject: string,
  buildHtml: (data: T) => string,
  buildText?: (data: T) => string,
): ((data: T) => EmailPayload) => {
  return (data) => ({
    to: (data as any).to,
    subject,
    html: buildHtml(data),
    text: buildText ? buildText(data) : undefined,
  });
};

export const emailTemplates: { [K in EmailEvent]: (data: TemplateDataMap[K]) => EmailPayload } = {
  user_registered_contractor: createTemplate(
    'Welcome to Conforma — complete your verification',
    ({ name }) => `
      <p>Hi ${name ?? 'there'},</p>
      <p>Welcome to Conforma. Upload your license and insurance so homeowners can approve milestones quickly.</p>
      <p>Need help? Open the help drawer inside your dashboard for step-by-step guides.</p>
    `,
  ),
  user_registered_homeowner: createTemplate(
    'Welcome to Conforma — start your first project',
    ({ name }) => `
      <p>Hi ${name ?? 'there'},</p>
      <p>Thanks for joining Conforma. Create a project, invite your contractor, and fund milestones with escrow-backed protection.</p>
    `,
  ),
  invite_sent: createTemplate(
    'You have been invited to Conforma',
    ({ inviterName, jobTitle, acceptUrl }) => `
      <p>${inviterName ?? 'A Conforma user'} invited you to collaborate on "${jobTitle ?? 'a project'}".</p>
      <p><a href="${acceptUrl}">Accept the invitation</a> to review milestones, documents, and escrow terms.</p>
    `,
  ),
  invite_accepted: createTemplate(
    'Your Conforma invite was accepted',
    ({ inviteeEmail, jobTitle }) => `
      <p>${inviteeEmail} accepted your invitation for "${jobTitle ?? 'your project'}".</p>
      <p>Log in to confirm milestones and move toward funding.</p>
    `,
  ),
  escrow_funded: createTemplate(
    'Escrow funded successfully',
    ({ jobTitle, amount, currency }) => `
      <p>The escrow for "${jobTitle}" is funded.</p>
      <p>Amount secured: <strong>${formatCurrency(amount, currency)}</strong>.</p>
      <p>Milestones will be released once approved.</p>
    `,
  ),
  milestone_submitted: createTemplate(
    'Milestone submitted for review',
    ({ jobTitle, milestoneTitle }) => `
      <p>Your contractor submitted "${milestoneTitle}" for "${jobTitle}".</p>
      <p>Review the evidence and approve or request changes.</p>
    `,
  ),
  milestone_reminder_24h: createTemplate(
    'Reminder: milestone auto-approval in 24 hours',
    ({ jobTitle, milestoneTitle, dueAt }) => `
      <p>"${milestoneTitle}" for "${jobTitle}" will auto-approve within 24 hours (by ${formatDate(
        dueAt,
      )}).</p>
      <p>Upload additional evidence or respond to avoid automatic release.</p>
    `,
  ),
  milestone_approved: createTemplate(
    'Milestone approved',
    ({ jobTitle, milestoneTitle }) => `
      <p>You approved "${milestoneTitle}" for "${jobTitle}".</p>
      <p>Payout to the contractor is being processed.</p>
    `,
  ),
  milestone_auto_approved: createTemplate(
    'Milestone auto-approved',
    ({ jobTitle, milestoneTitle }) => `
      <p>"${milestoneTitle}" for "${jobTitle}" auto-approved after the review window elapsed.</p>
      <p>Future milestones will follow the same timeline.</p>
    `,
  ),
  dispute_opened: createTemplate(
    'Dispute opened on your project',
    ({ jobTitle, milestoneTitle, reason }) => `
      <p>A dispute was opened for "${milestoneTitle}" on "${jobTitle}".</p>
      <p>Reason: ${reason}</p>
      <p>Upload evidence and respond in Conforma so our team can assist.</p>
    `,
  ),
  dispute_resolved: createTemplate(
    'Dispute resolved',
    ({ jobTitle, milestoneTitle, resolution }) => `
      <p>The dispute on "${milestoneTitle}" for "${jobTitle}" is resolved.</p>
      <p>Outcome: ${resolution}</p>
    `,
  ),
  document_approved: createTemplate(
    'Document approved',
    ({ type }) => `
      <p>Your ${type.toLowerCase()} document is verified. Conforma badges will reflect the update shortly.</p>
    `,
  ),
  document_rejected: createTemplate(
    'Document rejected — action required',
    ({ type, reason }) => `
      <p>Your ${type.toLowerCase()} document was rejected.</p>
      ${reason ? `<p>Reason: ${reason}</p>` : ''}
      <p>Upload an updated file to regain your verified badge.</p>
    `,
  ),
  document_needs_review: createTemplate(
    'Document needs manual review',
    ({ type, reason }) => `
      <p>Your ${type.toLowerCase()} document needs additional review by Conforma.</p>
      ${reason ? `<p>Notes: ${reason}</p>` : ''}
      <p>We will notify you once a final decision is made.</p>
    `,
  ),
  document_expiring_soon: createTemplate(
    'Document expiring soon',
    ({ type, effectiveTo }) => `
      <p>Your ${type.toLowerCase()} document will expire on ${formatDate(effectiveTo)}.</p>
      <p>Upload a new document to keep your verified badge active.</p>
    `,
  ),
  payout_initiated: createTemplate(
    'Payout initiated',
    ({ amount, currency }) => `
      <p>Your payout is being processed.</p>
      <p>Amount: <strong>${formatCurrency(amount, currency)}</strong>.</p>
    `,
  ),
  payout_settled: createTemplate(
    'Payout settled',
    ({ amount, currency }) => `
      <p>Your payout settled successfully.</p>
      <p>Amount: <strong>${formatCurrency(amount, currency)}</strong>.</p>
    `,
  ),
  weekly_founder_digest: createTemplate(
    'Weekly autonomy digest',
    ({ windowStart, windowEnd, metrics }) => {
      const lines = [
        `Digest window: ${windowStart.toISOString()} → ${windowEnd.toISOString()}`,
        '',
        `• New signups: ${metrics.newSignups}`,
        `• Funded jobs: ${metrics.fundedJobs}`,
        `• Avg payout latency: ${metrics.avgPayoutLatencyHours.toFixed(2)} hours`,
        `• Disputes opened/resolved: ${metrics.disputesOpened}/${metrics.disputesResolved}`,
        `• Verification approvals: ${metrics.verificationApprovals}`,
        `• Risk flags: ${metrics.riskFlags}`,
      ].join('\n');
      return `<p>${lines.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />')}</p><p>See /api/autonomy/health for cron status.</p>`;
    },
  ),
  risk_review_required: createTemplate(
    'Job requires manual risk review',
    ({ jobTitle, reasons, score }) => `
      <p>Job "${jobTitle}" requires manual review before funding.</p>
      <p>Risk score: ${score}</p>
      <ul>${reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
    `,
  ),
  funding_blocked_alert: createTemplate(
    'Funding blocked — manual action required',
    ({ jobTitle, reasons, score }) => `
      <p>Funding for "${jobTitle}" was blocked automatically.</p>
      <p>Risk score: ${score}</p>
      <ul>${reasons.map((r) => `<li>${r}</li>`).join('')}</ul>
    `,
  ),
  webhook_failure_alert: createTemplate(
    'Webhook processing failed',
    ({ source, error }) => `
      <p>Webhook processing failed for <strong>${source}</strong>.</p>
      <p>Error: ${error}</p>
      <p>Review logs and replay if necessary.</p>
    `,
  ),
};
