import { metrics } from '@opentelemetry/api';
import { Prisma, PrismaClient, Role } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { appConfig } from '../config/app.config';
import * as notificationService from './notification.service';

type RiskDecision = 'ALLOW' | 'FLAG' | 'BLOCK';

type RiskEvaluationResult = {
  job: Awaited<ReturnType<typeof loadJobWithRelations>>;
  score: number;
  reasons: string[];
  decision: RiskDecision;
  thresholds: {
    allow: number;
    block: number;
  };
  config: Awaited<ReturnType<typeof ensureRiskConfig>>;
};

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'yopmail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'trashmail.com',
  'maildrop.cc',
  'fakeinbox.com',
]);

const riskMeter = metrics.getMeter('conforma.risk');
const riskCounter = riskMeter.createCounter('risk_events_total', {
  description: 'Risk evaluations for funding attempts',
});

export const evaluateJobFundingRisk = async (
  jobId: string,
  prisma: PrismaClient = prismaClient,
): Promise<RiskEvaluationResult> => {
  const job = await loadJobWithRelations(jobId, prisma);
  const config = await ensureRiskConfig(prisma);
  const tradeCaps = parseTradeCaps(config.maxJobAmountByTrade);
  const reasons: string[] = [];
  let score = 0;

  if (isDisposableEmail(job.homeowner.user?.email)) {
    score += 20;
    reasons.push('DISPOSABLE_HOMEOWNER_EMAIL');
  }

  const secondsSinceCreation = (Date.now() - job.createdAt.getTime()) / 1000;
  if (secondsSinceCreation < 60) {
    score += 20;
    reasons.push('FUNDING_REQUEST_LT_60_SECONDS');
  }

  const state = job.homeowner.state?.toUpperCase() ?? 'UNKNOWN';
  const whitelist = appConfig.risk.stateWhitelist.length > 0 ? appConfig.risk.stateWhitelist : appConfig.allowedStates;
  if (!whitelist.includes(state)) {
    score += 15;
    reasons.push('HOMEOWNER_STATE_NOT_WHITELISTED');
  }

  const unresolvedDisputes = await countRecentUnresolvedDisputes(job.contractorId, prisma);
  if (unresolvedDisputes >= 2) {
    score += 15;
    reasons.push('RECENT_CONTRACTOR_DISPUTES');
  }

  const tradeKey = (job.contractor.trade ?? job.contractor.trades?.[0] ?? 'OTHER').toUpperCase();
  const tradeCap = tradeCaps[tradeKey];
  if (typeof tradeCap === 'number' && job.totalPrice > tradeCap) {
    score += 10;
    reasons.push('JOB_AMOUNT_ABOVE_TRADE_CAP');
  }

  const decision = determineDecision(score, config);

  await prisma.riskEvent.create({
    data: {
      jobId: job.id,
      score,
      reasons,
    },
  });

  riskCounter.add(1, {
    decision,
    homeowner_state: state,
    contractor_id: job.contractorId,
    trade: tradeKey,
    risk_score: score,
  });

  return {
    job,
    score,
    reasons,
    decision,
    thresholds: {
      allow: config.allowThreshold,
      block: config.blockThreshold,
    },
    config,
  };
};

export const notifyRiskDecision = async (
  evaluation: RiskEvaluationResult,
  prisma: PrismaClient = prismaClient,
) => {
  if (evaluation.decision === 'ALLOW') {
    return;
  }

  const homeownerEmail = evaluation.job.homeowner.user?.email;
  const contractorEmail = evaluation.job.contractor.user?.email;
  const jobTitle = evaluation.job.title;
  const reasonSummary = evaluation.reasons.join(', ');
  const supportEmail = appConfig.supportEmail;

  const flagMessage = [
    `Risk score: ${evaluation.score}`,
    `Triggers: ${reasonSummary || 'none recorded'}`,
    'Conforma has paused funding while the risk team reviews this job.',
  ].join('\n');

  if (homeownerEmail) {
    const subject =
      evaluation.decision === 'BLOCK'
        ? `Conforma: Funding blocked for ${jobTitle}`
        : `Conforma: Funding under review for ${jobTitle}`;
    const body = [
      evaluation.decision === 'BLOCK'
        ? 'We were unable to approve funding for this job automatically.'
        : 'We flagged this job for manual review before releasing funds.',
      flagMessage,
      `Our team will reach out within 24 hours. For questions, contact ${supportEmail}.`,
    ].join('\n');

    notificationService.sendEmail(
      homeownerEmail,
      subject,
      `${body}\n\nThank you,\nConforma Risk`,
      `<p>${body.replace(/\n/g, '</p><p>')}</p><p>Thank you,<br/>Conforma Risk</p>`,
    );
  }

  if (contractorEmail && evaluation.decision === 'BLOCK') {
    notificationService.sendEmail(
      contractorEmail,
      `Conforma: Funding blocked for ${jobTitle}`,
      `Funding cannot proceed at this time. Risk score ${evaluation.score}. Please contact ${supportEmail} for assistance.`,
      `<p>Funding cannot proceed at this time. Risk score ${evaluation.score}. Please contact <a href="mailto:${supportEmail}">${supportEmail}</a> for assistance.</p>`,
    );
  }

  const admins = await prisma.user.findMany({
    where: { role: Role.ADMIN },
    select: { id: true, email: true },
  });

  for (const admin of admins) {
    await notificationService.createInAppNotification(admin.id, 'RISK_EVENT_REVIEW', {
      jobId: evaluation.job.id,
      title: evaluation.job.title,
      score: evaluation.score,
      decision: evaluation.decision,
      reasons: evaluation.reasons,
    });

    if (admin.email) {
      notificationService.sendEmail(
        admin.email,
        `Risk ${evaluation.decision} for job ${jobTitle}`,
        `Job ${jobTitle} (${evaluation.job.id}) scored ${evaluation.score}.\nTriggers: ${reasonSummary}.`,
        `<p>Job <strong>${jobTitle}</strong> (${evaluation.job.id}) scored ${evaluation.score}.</p><p>Triggers: ${reasonSummary}.</p>`,
      );
    }
  }
};

export const getLatestRiskEvent = async (jobId: string, prisma: PrismaClient = prismaClient) => {
  return prisma.riskEvent.findFirst({
    where: { jobId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getRiskConfig = async (prisma: PrismaClient = prismaClient) => {
  const config = await ensureRiskConfig(prisma);
  return {
    id: config.id,
    allowThreshold: config.allowThreshold,
    blockThreshold: config.blockThreshold,
    maxJobAmountByTrade: parseTradeCaps(config.maxJobAmountByTrade),
    updatedAt: config.updatedAt,
    createdAt: config.createdAt,
  };
};

type UpdateRiskConfigInput = {
  allowThreshold?: number;
  blockThreshold?: number;
  maxJobAmountByTrade?: Record<string, number>;
};

export const updateRiskConfig = async (
  input: UpdateRiskConfigInput,
  prisma: PrismaClient = prismaClient,
) => {
  const config = await ensureRiskConfig(prisma);
  const data: Prisma.RiskConfigUpdateInput = {};

  if (typeof input.allowThreshold === 'number') {
    data.allowThreshold = input.allowThreshold;
  }
  if (typeof input.blockThreshold === 'number') {
    data.blockThreshold = input.blockThreshold;
  }
  if (input.maxJobAmountByTrade) {
    data.maxJobAmountByTrade = input.maxJobAmountByTrade as Prisma.InputJsonObject;
  }

  const updated = await prisma.riskConfig.update({
    where: { id: config.id },
    data,
  });

  return {
    id: updated.id,
    allowThreshold: updated.allowThreshold,
    blockThreshold: updated.blockThreshold,
    maxJobAmountByTrade: parseTradeCaps(updated.maxJobAmountByTrade),
    updatedAt: updated.updatedAt,
    createdAt: updated.createdAt,
  };
};

const ensureRiskConfig = async (prisma: PrismaClient) => {
  let config = await prisma.riskConfig.findUnique({ where: { id: 1 } });
  if (!config) {
    config = await prisma.riskConfig.create({
      data: {
        id: 1,
        allowThreshold: 25,
        blockThreshold: 50,
        maxJobAmountByTrade: {},
      },
    });
  }
  return config;
};

const loadJobWithRelations = async (jobId: string, prisma: PrismaClient) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      homeowner: {
        include: {
          user: true,
        },
      },
      contractor: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!job || !job.homeowner || !job.homeowner.user || !job.contractor || !job.contractor.user) {
    throw new Error('Job not found');
  }

  return job;
};

const parseTradeCaps = (value: Prisma.JsonValue | null): Record<string, number> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const result: Record<string, number> = {};
  for (const [key, raw] of Object.entries(value)) {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      result[key.toUpperCase()] = parsed;
    }
  }
  return result;
};

const isDisposableEmail = (email?: string | null) => {
  if (!email || !email.includes('@')) {
    return false;
  }
  const domain = email.split('@')[1]?.toLowerCase();
  return DISPOSABLE_DOMAINS.has(domain);
};

const countRecentUnresolvedDisputes = async (
  contractorId: string,
  prisma: PrismaClient,
) => {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  return prisma.dispute.count({
    where: {
      status: { notIn: ['RESOLVED'] },
      createdAt: { gte: ninetyDaysAgo },
      milestone: {
        job: {
          contractorId,
        },
      },
    },
  });
};

const determineDecision = (
  score: number,
  config: { allowThreshold: number; blockThreshold: number },
): RiskDecision => {
  if (score >= config.blockThreshold) {
    return 'BLOCK';
  }
  if (score >= config.allowThreshold) {
    return 'FLAG';
  }
  return 'ALLOW';
};
