import axios from 'axios';
import PQueue from 'p-queue';
import Tesseract from 'tesseract.js';
import { metrics, trace, SpanStatusCode } from '@opentelemetry/api';
import { Prisma, PrismaClient, DocumentStatus, DocumentAiStatus, DocumentType, Role } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { logger } from '../utils/logger';
import * as notificationService from './notification.service';
import { getOpenAIClient, isAiConfigured, resolveOpenAiModel } from '../lib/openai';

type VerificationOptions = {
  force?: boolean;
};

type DownloadedFile = {
  buffer: Buffer;
  contentType?: string;
  sourceUrl: string;
};

type ParsedFields = {
  issuer?: string;
  policyNumber?: string;
  effectiveFrom?: Date | null;
  effectiveTo?: Date | null;
  coverage: string[];
};

type LlmExtraction = {
  issuer?: string;
  policyNumber?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  coverage?: string[];
} | null;

type VerificationDecision = {
  aiStatus: DocumentAiStatus;
  status: DocumentStatus;
  confidence: number;
  reason: string;
  fields: ParsedFields;
};

const OCR_CONCURRENCY = Math.max(Number(process.env.OCR_CONCURRENCY ?? '2'), 1);
const verificationQueue = new PQueue({ concurrency: OCR_CONCURRENCY });
const scheduledDocuments = new Set<string>();

const COVERAGE_KEYWORDS: Array<{ key: string; label: string }> = [
  { key: 'general liability', label: 'General Liability' },
  { key: 'workers compensation', label: 'Workers Compensation' },
  { key: 'worker\'s compensation', label: 'Workers Compensation' },
  { key: 'commercial auto', label: 'Commercial Auto' },
  { key: 'umbrella', label: 'Umbrella' },
  { key: 'bond', label: 'Bond' },
  { key: 'professional liability', label: 'Professional Liability' },
  { key: 'errors and omissions', label: 'Errors & Omissions' },
];

let cachedAdminActorId: string | null = null;
let pdfjsPromise: Promise<any> | null = null;
let canvasModulePromise: Promise<any> | null = null;

const verifierTracer = trace.getTracer('conforma.verification');
const verificationMeter = metrics.getMeter('conforma.verification');
const verificationCounter = verificationMeter.createCounter('document_verifications_total', {
  description: 'Total document verification attempts',
});
const verificationApprovedCounter = verificationMeter.createCounter('document_verifications_approved_total', {
  description: 'Documents approved automatically by AI verifier',
});
const verificationDuration = verificationMeter.createHistogram('document_verification_duration_ms', {
  description: 'Duration of document verification in milliseconds',
});

const runWithSpan = async <T>(name: string, fn: () => Promise<T> | T): Promise<T> => {
  return verifierTracer.startActiveSpan(name, async (span) => {
    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      throw error;
    } finally {
      span.end();
    }
  });
};

export const initializeInsuranceVerifier = async (prisma: PrismaClient = prismaClient) => {
  try {
    const pendingDocs = await prisma.document.findMany({
      where: {
        status: DocumentStatus.PENDING,
        aiStatus: { in: [DocumentAiStatus.NONE, DocumentAiStatus.NEEDS_REVIEW] },
      },
      select: { id: true },
    });
    pendingDocs.forEach((doc) => enqueueInsuranceVerification(doc.id, { force: true }));
  } catch (error) {
    logger.error('Failed to schedule pending document verifications', error);
  }
};

export const enqueueInsuranceVerification = (documentId: string, options: VerificationOptions = {}) => {
  if (!options.force && scheduledDocuments.has(documentId)) {
    return;
  }

  scheduledDocuments.add(documentId);
  verificationQueue
    .add(async () => {
      try {
        await verifyDocumentInternal(documentId);
      } catch (error) {
        logger.error(`Verification failed for document ${documentId}`, error);
      } finally {
        scheduledDocuments.delete(documentId);
      }
    })
    .catch((error) => {
      scheduledDocuments.delete(documentId);
      logger.error(`Failed to queue verification for document ${documentId}`, error);
    });
};

export const reverifyDocument = async (documentId: string) => {
  enqueueInsuranceVerification(documentId, { force: true });
};

const verifyDocumentInternal = async (documentId: string, prisma: PrismaClient = prismaClient) => {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      user: true,
    },
  });

  if (!document) {
    logger.warn(`Document ${documentId} not found for verification`);
    return;
  }

  verificationCounter.add(1, { document_type: document.type });
  const startedAt = Date.now();
  let decisionSummary: VerificationDecision | null = null;

  try {
    await verifierTracer.startActiveSpan('document.verify', async (span) => {
      try {
        span.setAttributes({
          'document.id': document.id,
          'document.type': document.type,
        });

        const downloaded = await runWithSpan('document.download', () => downloadDocument(document.url));
        span.setAttribute('document.download.content_type', downloaded.contentType ?? 'unknown');

        const pages = await runWithSpan('document.ocr', () => extractText(downloaded));
        const aggregatedText = pages.join('\n\n').trim();
        if (!aggregatedText) {
          throw new Error('OCR produced no text');
        }

        const regexParsed = parseWithRegex(aggregatedText);
        const llmParsed = await runLlmExtraction(aggregatedText);
        const mergedFields = mergeParsedFields(regexParsed, llmParsed);
        const decision = decideVerification(document.type, mergedFields);
        decisionSummary = decision;

        span.setAttributes({
          'document.verification.status': decision.status,
          'document.verification.aiStatus': decision.aiStatus,
          'document.verification.confidence': decision.confidence,
        });

        if (decision.status === DocumentStatus.APPROVED) {
          verificationApprovedCounter.add(1, { document_type: document.type });
        }

        await persistDecision(prisma, document, decision, aggregatedText);
        await notifyContractor(document, decision);
        span.setStatus({ code: SpanStatusCode.OK });
      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
        throw error;
      } finally {
        span.end();
      }
    });
  } catch (error) {
    logger.error(`Document verification failed (${documentId})`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        aiStatus: DocumentAiStatus.NEEDS_REVIEW,
        status: DocumentStatus.NEEDS_REVIEW,
        aiConfidence: new Prisma.Decimal('0.3'),
        aiReason: `Automated verification failed: ${(error as Error).message}`,
      },
    });
  } finally {
    const elapsed = Date.now() - startedAt;
    verificationDuration.record(elapsed, {
      document_type: document.type,
      decision: decisionSummary?.status ?? 'ERROR',
    });
  }
};

const downloadDocument = async (url: string): Promise<DownloadedFile> => {
  const response = await axios.get<ArrayBuffer>(url, {
    responseType: 'arraybuffer',
    timeout: 20000,
    validateStatus: (status) => status >= 200 && status < 400,
  });

  const contentType = response.headers['content-type'] as string | undefined;
  return {
    buffer: Buffer.from(response.data),
    contentType,
    sourceUrl: url,
  };
};

const extractText = async (file: DownloadedFile): Promise<string[]> => {
  const contentType = (file.contentType ?? '').toLowerCase();
  const url = file.sourceUrl.toLowerCase();

  if (contentType.includes('pdf') || url.endsWith('.pdf')) {
    return extractTextFromPdf(file.buffer);
  }

  return [await runTesseract(file.buffer)];
};

const extractTextFromPdf = async (buffer: Buffer): Promise<string[]> => {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item: any) => ('str' in item ? String(item.str) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 20) {
      pageTexts.push(text);
      continue;
    }

    const rasterized = await rasterizePdfPage(page);
    if (rasterized) {
      const ocrText = await runTesseract(rasterized);
      pageTexts.push(ocrText);
    }
  }

  return pageTexts;
};

const loadPdfJs = async () => {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist/legacy/build/pdf.js').then((module) => {
      const pdfjs = ((module as any).default ?? module) as any;
      if (pdfjs && pdfjs.GlobalWorkerOptions) {
        pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.js';
      }
      return pdfjs;
    });
  }

  return pdfjsPromise;
};

const rasterizePdfPage = async (page: any): Promise<Buffer | null> => {
  if (!canvasModulePromise) {
    canvasModulePromise = import('canvas').catch(() => null);
  }
  const canvasModule = await canvasModulePromise;
  if (!canvasModule) {
    return null;
  }

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = canvasModule.createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  const renderContext = {
    canvasContext: context,
    viewport,
  };

  await page.render(renderContext).promise;
  return canvas.toBuffer('image/png');
};

const runTesseract = async (buffer: Buffer): Promise<string> => {
  const { data } = await Tesseract.recognize(buffer, 'eng', {
    tessjs_create_pdf: '0',
  });
  return data?.text?.replace(/\s+/g, ' ').trim() ?? '';
};

const parseWithRegex = (text: string): ParsedFields => {
  const coverage: Set<string> = new Set();
  const lower = text.toLowerCase();

  COVERAGE_KEYWORDS.forEach((entry) => {
    if (lower.includes(entry.key)) {
      coverage.add(entry.label);
    }
  });

  const policyMatch = text.match(/policy\s*(?:number|no\.?)\s*[:#]?\s*([A-Z0-9\-]+)/i);
  const issuerMatch =
    text.match(/(?:insurer|issuer|carrier|company)\s*[:\-]?\s*([A-Za-z0-9&.,' -]{3,}?)(?=\s+(?:policy|coverage|effective|expiration|exp|limits)\b|\s*$)/i) ??
    text.match(/(?:produced by|produced for)\s*[:\-]?\s*([A-Za-z0-9&.,' -]{3,}?)(?=\s+(?:policy|coverage|effective|expiration|exp|limits)\b|\s*$)/i);
  const effectiveFromMatch = text.match(/(?:effective\s*(?:date|from)|issue\s*date)\s*[:#]?\s*([A-Za-z0-9\/,\-\s]{4,30})/i);
  const effectiveToMatch =
    text.match(/(?:expiration|expiry|exp\.?|expires)\s*(?:date|on)?\s*[:#]?\s*([A-Za-z0-9\/,\-\s]{4,30})/i) ??
    text.match(/(?:effective\s*(?:to|through))\s*[:#]?\s*([A-Za-z0-9\/,\-\s]{4,30})/i);

  return {
    issuer: sanitizeText(issuerMatch?.[1]),
    policyNumber: sanitizePolicyNumber(policyMatch?.[1]),
    effectiveFrom: parseDateString(effectiveFromMatch?.[1]),
    effectiveTo: parseDateString(effectiveToMatch?.[1]),
    coverage: Array.from(coverage),
  };
};

const runLlmExtraction = async (text: string): Promise<LlmExtraction> => {
  const normalizedText = text.length > 6000 ? `${text.slice(0, 6000)}...` : text;
  const prompt = `You are verifying contractor compliance documents. Extract key fields from the following text. Respond with a JSON object containing keys issuer (string), policyNumber (string), effectiveFrom (ISO 8601 date), effectiveTo (ISO 8601 date), coverage (array of strings). If a value is missing, use null.

Document text:
"""
${normalizedText}
"""`;

  const ollamaResponse = await callOllama(prompt);
  if (ollamaResponse) {
    return ollamaResponse;
  }

  const openAiResponse = await callOpenAi(prompt);
  return openAiResponse;
};

const callOllama = async (prompt: string): Promise<LlmExtraction> => {
  const baseUrl = process.env.OLLAMA_URL?.trim();
  const model = process.env.OLLAMA_MODEL?.trim() || 'llama3.1:8b';
  if (!baseUrl) {
    return null;
  }

  try {
    const response = await axios.post(
      `${baseUrl.replace(/\/$/, '')}/api/generate`,
      {
        model,
        prompt: `${prompt}\nReturn JSON only.`,
        options: { temperature: 0.1 },
        stream: false,
      },
      { timeout: 25000 },
    );

    const raw = response.data?.response ?? '';
    return parseLlmJson(raw);
  } catch (error) {
    logger.warn('Ollama extraction failed, falling back to OpenAI if available', error);
    return null;
  }
};

const callOpenAi = async (prompt: string): Promise<LlmExtraction> => {
  if (!isAiConfigured()) {
    return null;
  }

  try {
    const client = getOpenAIClient();
    const model = resolveOpenAiModel();
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You extract insurance and licensing document metadata for Conforma. Respond with strict JSON only.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? '';
    return parseLlmJson(content);
  } catch (error) {
    logger.warn('OpenAI extraction failed', error);
    return null;
  }
};

const parseLlmJson = (raw: string): LlmExtraction => {
  if (!raw) {
    return null;
  }

  const trimmed = raw.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  try {
    const json = JSON.parse(trimmed.slice(start, end + 1));
    return {
      issuer: typeof json.issuer === 'string' ? sanitizeText(json.issuer) : undefined,
      policyNumber: sanitizePolicyNumber(json.policyNumber),
      effectiveFrom: typeof json.effectiveFrom === 'string' ? json.effectiveFrom : undefined,
      effectiveTo: typeof json.effectiveTo === 'string' ? json.effectiveTo : undefined,
      coverage: Array.isArray(json.coverage)
        ? json.coverage.map((item: unknown) => sanitizeText(String(item))).filter(Boolean)
        : undefined,
    };
  } catch (error) {
    logger.warn('Failed to parse LLM JSON output', error);
    return null;
  }
};

const mergeParsedFields = (regexParsed: ParsedFields, llmParsed: LlmExtraction): ParsedFields => {
  const mergedCoverage = new Set<string>(regexParsed.coverage);
  if (llmParsed?.coverage) {
    llmParsed.coverage.forEach((item) => {
      if (item) {
        mergedCoverage.add(item);
      }
    });
  }

  return {
    issuer: regexParsed.issuer ?? sanitizeText(llmParsed?.issuer),
    policyNumber: regexParsed.policyNumber ?? sanitizePolicyNumber(llmParsed?.policyNumber),
    effectiveFrom:
      regexParsed.effectiveFrom ??
      (llmParsed?.effectiveFrom ? parseDateString(llmParsed.effectiveFrom) : null),
    effectiveTo:
      regexParsed.effectiveTo ??
      (llmParsed?.effectiveTo ? parseDateString(llmParsed.effectiveTo) : null),
    coverage: Array.from(mergedCoverage),
  };
};

const decideVerification = (type: DocumentType, fields: ParsedFields): VerificationDecision => {
  const now = new Date();
  const withinWindow =
    fields.effectiveFrom && fields.effectiveTo
      ? fields.effectiveFrom <= now && fields.effectiveTo >= now
      : Boolean(fields.effectiveTo ? fields.effectiveTo >= now : true);

  let confidence = 0.3;
  const reasons: string[] = [];

  if (fields.policyNumber) {
    confidence += 0.25;
    reasons.push('Policy or license number detected.');
  } else {
    reasons.push('Policy/license number missing.');
  }

  if (fields.issuer) {
    confidence += 0.2;
    reasons.push('Issuer identified.');
  } else {
    reasons.push('Issuer not confidently identified.');
  }

  if (fields.effectiveFrom && fields.effectiveTo) {
    confidence += 0.15;
    reasons.push('Effective date range extracted.');
  }

  if (withinWindow) {
    confidence += 0.15;
    reasons.push('Document appears current.');
  } else if (fields.effectiveTo && fields.effectiveTo < now) {
    reasons.push('Document appears expired.');
  }

  if (fields.coverage.some((item) => /liability|workers/i.test(item))) {
    confidence += 0.1;
    reasons.push('Coverage keywords detected.');
  }

  confidence = Math.min(confidence, 0.98);

  if (fields.effectiveTo && fields.effectiveTo < now) {
    return {
      aiStatus: DocumentAiStatus.REJECTED,
      status: DocumentStatus.REJECTED,
      confidence,
      reason: `${reasons.join(' ')} Auto-rejected because coverage appears expired.`,
      fields,
    };
  }

  if (fields.policyNumber && fields.issuer && withinWindow) {
    const adjustedConfidence = Math.max(confidence, 0.82);
    return {
      aiStatus: DocumentAiStatus.APPROVED,
      status: adjustedConfidence >= 0.8 ? DocumentStatus.APPROVED : DocumentStatus.NEEDS_REVIEW,
      confidence: adjustedConfidence,
      reason: `${reasons.join(' ')} Auto-approved with confidence score ${adjustedConfidence.toFixed(2)}.`,
      fields,
    };
  }

  return {
    aiStatus: DocumentAiStatus.NEEDS_REVIEW,
    status: DocumentStatus.NEEDS_REVIEW,
    confidence,
    reason: `${reasons.join(' ')} Flagged for manual review.`,
    fields,
  };
};

const persistDecision = async (
  prisma: PrismaClient,
  document: any,
  decision: VerificationDecision,
  textPreview: string,
) => {
  const updateData: Prisma.DocumentUpdateInput = {
    aiStatus: decision.aiStatus,
    status: decision.status,
    aiConfidence: new Prisma.Decimal(decision.confidence.toFixed(4)),
    aiReason: decision.reason,
    issuer: decision.fields.issuer ?? null,
    policyNumber: decision.fields.policyNumber ?? null,
    effectiveFrom: decision.fields.effectiveFrom ?? null,
    effectiveTo: decision.fields.effectiveTo ?? null,
  };

  await prisma.document.update({
    where: { id: document.id },
    data: updateData,
  });

  await upsertContractorBadge(prisma, document.userId, document.type, decision.status);

  const actorUserId = await resolveAiActor(prisma);
  if (actorUserId) {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        entity: 'Document',
        entityId: document.id,
        action: 'AI_VERIFICATION',
        metadata: {
          status: decision.status,
          aiStatus: decision.aiStatus,
          confidence: decision.confidence,
          issuer: decision.fields.issuer,
          policyNumber: decision.fields.policyNumber,
          effectiveFrom: decision.fields.effectiveFrom?.toISOString() ?? null,
          effectiveTo: decision.fields.effectiveTo?.toISOString() ?? null,
          coverage: decision.fields.coverage,
          preview: textPreview.slice(0, 500),
        },
      },
    });
  }
};

const notifyContractor = async (document: any, decision: VerificationDecision) => {
  const statusLabel = decision.status;
  const subjectMap: Record<DocumentStatus, string> = {
    [DocumentStatus.APPROVED]: 'Conforma: Your document was automatically approved',
    [DocumentStatus.NEEDS_REVIEW]: 'Conforma: Your document needs manual review',
    [DocumentStatus.REJECTED]: 'Conforma: Your document was rejected',
    [DocumentStatus.PENDING]: 'Conforma: Document pending review',
    [DocumentStatus.EXPIRED]: 'Conforma: Your document has expired',
  };

  const subject = subjectMap[statusLabel] ?? 'Conforma: Document update';
  const baseMessage = [
    `Document type: ${document.type}`,
    `AI status: ${decision.aiStatus}`,
    `Confidence: ${(decision.confidence * 100).toFixed(0)}%`,
    `Details: ${decision.reason}`,
    decision.fields.policyNumber ? `Policy/license number: ${decision.fields.policyNumber}` : null,
    decision.fields.issuer ? `Issuer: ${decision.fields.issuer}` : null,
    decision.fields.effectiveFrom ? `Effective from: ${decision.fields.effectiveFrom.toDateString()}` : null,
    decision.fields.effectiveTo ? `Effective to: ${decision.fields.effectiveTo.toDateString()}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  if (document.user?.email) {
    notificationService.sendEmail(
      document.user.email,
      subject,
      `${baseMessage}\n\nVisit your dashboard to view the decision details and next steps.`,
      `<p>${baseMessage.replace(/\n/g, '<br />')}</p><p>Visit your dashboard to view the decision details and next steps.</p>`,
    );
  }

  const notificationType =
    decision.status === DocumentStatus.APPROVED
      ? 'DOCUMENT_APPROVED'
      : decision.status === DocumentStatus.REJECTED
      ? 'DOCUMENT_REJECTED'
      : 'DOCUMENT_NEEDS_REVIEW';

  await notificationService.createInAppNotification(document.userId, notificationType, {
    documentId: document.id,
    decision,
  });
};

const upsertContractorBadge = async (
  prisma: PrismaClient,
  userId: string,
  type: DocumentType,
  status: DocumentStatus,
) => {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!contractor) {
    return;
  }

  const shouldVerify = status === DocumentStatus.APPROVED;

  if (type === DocumentType.INSURANCE) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedInsurance: shouldVerify },
    });
  }

  if (type === DocumentType.LICENSE || type === DocumentType.CERT) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedLicense: shouldVerify },
    });
  }
};

const resolveAiActor = async (prisma: PrismaClient): Promise<string | null> => {
  if (cachedAdminActorId) {
    return cachedAdminActorId;
  }

  const adminUser = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  });

  if (adminUser) {
    cachedAdminActorId = adminUser.id;
    return cachedAdminActorId;
  }

  return null;
};

const sanitizeText = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.replace(/\s+/g, ' ').trim();
  return trimmed.length > 2 ? trimmed : undefined;
};

const sanitizePolicyNumber = (value?: string | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const cleaned = value.replace(/[^A-Z0-9\-]/gi, '').toUpperCase();
  return cleaned.length >= 4 ? cleaned : undefined;
};

const parseDateString = (raw?: string | null): Date | null => {
  if (!raw) {
    return null;
  }

  const cleaned = raw.replace(/(st|nd|rd|th)/gi, '').replace(/\s+/g, ' ').trim();
  const direct = Date.parse(cleaned);
  if (!Number.isNaN(direct)) {
    const parsed = new Date(direct);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  const numericMatch = cleaned.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (numericMatch) {
    const month = Number(numericMatch[1]);
    const day = Number(numericMatch[2]);
    let year = Number(numericMatch[3]);
    if (year < 100) {
      year += year > 80 ? 1900 : 2000;
    }
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

export const verificationTestHelpers = {
  parseWithRegex,
  mergeParsedFields,
  decideVerification,
  parseDateString,
};
