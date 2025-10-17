import { AiDisputeSuggestion, Prisma, PrismaClient } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { appConfig } from '../config/app.config';
import { getOpenAIClient, isAiConfigured } from '../lib/openai';

type TriageResult = {
  summary: string;
  suggestion: AiDisputeSuggestion;
  confidence: number;
  modelInfo: Record<string, unknown>;
};

const DEFAULT_MODEL = 'gpt-4o-mini';

export const triageDispute = async (disputeId: string, prisma: PrismaClient = prismaClient) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      milestone: {
        include: {
          job: {
            include: {
              homeowner: { include: { user: true } },
              contractor: { include: { user: true } },
            },
          },
          evidence: true,
        },
      },
    },
  });

  if (!dispute) {
    throw new Error('Dispute not found.');
  }

  const triageResult = appConfig.aiTriageEnabled && isAiConfigured()
    ? await runAiTriage(dispute)
    : buildDeterministicFallback(dispute);

  const record = await prisma.aiDisputeSummary.upsert({
    where: { disputeId },
    update: {
      summary: triageResult.summary,
      suggestion: triageResult.suggestion,
      confidence: new Prisma.Decimal(Math.min(Math.max(triageResult.confidence, 0), 1)),
      modelInfo: triageResult.modelInfo,
    },
    create: {
      disputeId,
      summary: triageResult.summary,
      suggestion: triageResult.suggestion,
      confidence: new Prisma.Decimal(Math.min(Math.max(triageResult.confidence, 0), 1)),
      modelInfo: triageResult.modelInfo,
    },
  });

  return record;
};

export const getDisputeTriage = async (disputeId: string, prisma: PrismaClient = prismaClient) => {
  return prisma.aiDisputeSummary.findUnique({
    where: { disputeId },
  });
};

const runAiTriage = async (dispute: any): Promise<TriageResult> => {
  const openai = getOpenAIClient();
  const job = dispute.milestone.job;
  const homeowner = job.homeowner?.user;
  const contractor = job.contractor?.user;

  const attachments = (dispute.milestone.evidence ?? []).map((item: any) => ${item.type}: );

  const prompt = You are a dispute resolution analyst. Review the following context and return a JSON object with keys summary (string <= 200 words), suggestion (one of PARTIAL_RELEASE, PARTIAL_REFUND, RESUBMIT, UNSURE) and confidence (0-1).

Job Title: 
Milestone: 
Dispute Reason: 
Homeowner: 
Contractor: 
Evidence: 
;

  const response = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? DEFAULT_MODEL,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are Conforma\'s escrow dispute assistant. Provide concise summaries and recommendations for admin review. Always respond with JSON.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const message = response.choices[0].message?.content;
  if (!message) {
    throw new Error('AI response missing content');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(message);
  } catch (error) {
    throw new Error('Unable to parse AI response.');
  }

  const suggestion = mapSuggestion(parsed.suggestion);
  const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : Number(parsed.confidence ?? 0.6);

  return {
    summary: parsed.summary ?? 'No summary generated.',
    suggestion,
    confidence: Number.isFinite(confidence) ? confidence : 0.6,
    modelInfo: {
      provider: appConfig.aiProvider,
      model: process.env.AI_MODEL ?? DEFAULT_MODEL,
      usage: response.usage,
    },
  };
};

const buildDeterministicFallback = (dispute: any): TriageResult => {
  const milestone = dispute.milestone;
  const ratingSignal = milestone.job.contractor?.ratingAvg ?? 0;
  const confidence = ratingSignal >= 4.5 ? 0.35 : 0.5;

  return {
    summary: Milestone "" is under review with homeowner concerns: . Evidence count: . Recommend manual review due to limited AI capabilities in this environment.,
    suggestion: AiDisputeSuggestion.UNSURE,
    confidence,
    modelInfo: {
      provider: 'deterministic-fallback',
      enabled: appConfig.aiTriageEnabled,
    },
  };
};

const mapSuggestion = (value: string): AiDisputeSuggestion => {
  const normalized = String(value ?? '').toUpperCase();
  if (normalized.includes('REFUND')) {
    return AiDisputeSuggestion.PARTIAL_REFUND;
  }
  if (normalized.includes('RELEASE')) {
    return AiDisputeSuggestion.PARTIAL_RELEASE;
  }
  if (normalized.includes('RESUBMIT')) {
    return AiDisputeSuggestion.RESUBMIT;
  }
  return AiDisputeSuggestion.UNSURE;
};
