import { randomUUID } from 'crypto';
import {
  AIStatus,
  DocumentStatus,
  DocumentType,
  Prisma,
  PrismaClient,
  Role,
} from '@prisma/client';
import prismaClient from '../lib/prisma';
import * as notificationService from './notification.service';
import { notify } from '../lib/email/notifier';
import { enqueueInsuranceVerification, reverifyDocument as queueReverification } from './insuranceVerifier';
import { getCdnBaseUrl, getUploadBaseUrl } from '../utils/uploads';

export async function createUploadUrl(
  userId: string,
  type: DocumentType,
) {
  const key = `verification/${userId}/${type.toLowerCase()}-${randomUUID()}`;
  const baseUploadUrl = getUploadBaseUrl();
  const cdnBaseUrl = getCdnBaseUrl();

  return {
    uploadUrl: `${baseUploadUrl}/${key}`,
    fileUrl: `${cdnBaseUrl}/${key}`,
    fields: {
      'x-amz-meta-user-id': userId,
      'x-amz-meta-document-type': type,
    },
  };
}

export async function createDocumentRecord(
  userId: string,
  type: DocumentType,
  fileUrl: string,
  prisma: PrismaClient = prismaClient,
) {
  const document = await prisma.document.create({
    data: {
      userId,
      type,
      url: fileUrl,
      status: DocumentStatus.PENDING,
      aiStatus: AIStatus.NONE,
      aiReason: null,
    },
  });

  await notificationService.createInAppNotification(userId, 'DOCUMENT_UPLOADED', {
    documentId: document.id,
    type,
  });

  if (
    type === DocumentType.INSURANCE ||
    type === DocumentType.LICENSE ||
    type === DocumentType.CERT
  ) {
    enqueueInsuranceVerification(document.id, { force: true });
  }

  return document;
}

export async function listUserDocuments(
  userId: string,
  prisma: PrismaClient = prismaClient,
) {
  return prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function listDocumentsByStatus(
  status: DocumentStatus | undefined,
  prisma: PrismaClient = prismaClient,
) {
  return prisma.document.findMany({
    where: status ? { status } : undefined,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          contractor: {
            select: {
              id: true,
              companyName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });
}

async function applyContractorBadge(
  type: DocumentType,
  userId: string,
  prisma: PrismaClient,
) {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
  });
  if (!contractor) {
    return;
  }

  if (type === DocumentType.LICENSE) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedLicense: true },
    });
  }
  if (type === DocumentType.INSURANCE) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedInsurance: true },
    });
  }
}

async function revokeContractorBadge(
  type: DocumentType,
  userId: string,
  prisma: PrismaClient,
) {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
  });
  if (!contractor) {
    return;
  }

  if (type === DocumentType.LICENSE) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedLicense: false },
    });
  }
  if (type === DocumentType.INSURANCE) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: { verifiedInsurance: false },
    });
  }
}

export async function approveDocument(
  documentId: string,
  reviewerUserId: string,
  prisma: PrismaClient = prismaClient,
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.APPROVED,
      aiStatus: AIStatus.APPROVED,
      aiConfidence: new Prisma.Decimal(1),
      aiReason: `Manually approved by ${reviewerUserId} on ${new Date().toISOString()}`,
      notes: `Approved by ${reviewerUserId}`,
    },
  });

  await applyContractorBadge(updated.type, updated.userId, prisma);

  await notificationService.createInAppNotification(updated.userId, 'DOCUMENT_APPROVED', {
    documentId: updated.id,
    type: updated.type,
  });

  return updated;
}

export async function rejectDocument(
  documentId: string,
  notes: string,
  reviewerUserId: string,
  prisma: PrismaClient = prismaClient,
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.REJECTED,
      aiStatus: AIStatus.REJECTED,
      aiConfidence: new Prisma.Decimal(0.2),
      aiReason: `Rejected by ${reviewerUserId}`,
      notes,
    },
  });

  await revokeContractorBadge(updated.type, updated.userId, prisma);

  await notificationService.createInAppNotification(updated.userId, 'DOCUMENT_REJECTED', {
    documentId: updated.id,
    notes,
  });

  return updated;
}

type ReviewOptions = {
  reason?: string;
  effectiveTo?: Date | null;
};

export async function reviewDocumentStatus(
  documentId: string,
  status: DocumentStatus,
  reviewerUserId: string,
  options: ReviewOptions = {},
  prisma: PrismaClient = prismaClient,
) {
  if (status === DocumentStatus.APPROVED) {
    return approveDocument(documentId, reviewerUserId, prisma);
  }
  if (status === DocumentStatus.REJECTED) {
    return rejectDocument(documentId, options.reason ?? 'Rejected by admin', reviewerUserId, prisma);
  }

  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  const data: Prisma.DocumentUpdateInput = {
    status,
    notes: options.reason ?? null,
    aiReason:
      options.reason ?? `Status manually set to ${status} by ${reviewerUserId} at ${new Date().toISOString()}`,
    aiStatus: status === DocumentStatus.EXPIRED ? AIStatus.REJECTED : AIStatus.NEEDS_REVIEW,
    aiConfidence:
      status === DocumentStatus.EXPIRED
        ? new Prisma.Decimal(0.35)
        : new Prisma.Decimal(0.5),
  };

  if (options.effectiveTo !== undefined) {
    data.effectiveTo = options.effectiveTo;
  }

  const updated = await prisma.document.update({
    where: { id: documentId },
    data,
  });

  if (status === DocumentStatus.NEEDS_REVIEW || status === DocumentStatus.EXPIRED) {
    await revokeContractorBadge(updated.type, updated.userId, prisma);
  }

  await notificationService.createInAppNotification(updated.userId, 'DOCUMENT_STATUS_UPDATED', {
    documentId: updated.id,
    status,
    reason: options.reason,
  });

  return updated;
}

export async function reverifyDocumentById(
  documentId: string,
  prisma: PrismaClient = prismaClient,
) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new Error('Document not found');
  }

  await prisma.document.update({
    where: { id: documentId },
    data: {
      status: DocumentStatus.NEEDS_REVIEW,
      aiStatus: AIStatus.NEEDS_REVIEW,
      aiConfidence: new Prisma.Decimal(0),
      aiReason: `Reverification requested at ${new Date().toISOString()}`,
    },
  });

  queueReverification(documentId);
  return document;
}

export async function expireStaleDocuments(prisma: PrismaClient = prismaClient) {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const expiredDocs = await prisma.document.findMany({
    where: {
      effectiveTo: { lt: now },
      status: { in: [DocumentStatus.APPROVED, DocumentStatus.NEEDS_REVIEW] },
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  for (const document of expiredDocs) {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: DocumentStatus.EXPIRED,
        aiStatus: AIStatus.REJECTED,
        aiReason: `Document expired on ${document.effectiveTo?.toISOString()}`,
        aiConfidence: new Prisma.Decimal(0.35),
        notes: 'Automatically marked expired by system check.',
      },
    });

    await revokeContractorBadge(document.type, document.userId, prisma);

    const messageLines = [
      `Your ${document.type.toLowerCase()} document expired on ${document.effectiveTo?.toDateString()}.`,
      'Please upload a new document so we can keep your badges active.',
    ];

    if (document.user?.email) {
      notify('document_rejected', {
        to: document.user.email,
        type: document.type,
        reason: `Document expired on ${document.effectiveTo?.toDateString()}`,
      }).catch((error) => {
        console.error('Failed to send document expired email', error);
      });
    }

    await notificationService.createInAppNotification(document.userId, 'DOCUMENT_EXPIRED', {
      documentId: document.id,
      expiredAt: document.effectiveTo,
    });
  }

  const upcomingDocs = await prisma.document.findMany({
    where: {
      effectiveTo: {
        gt: now,
        lte: new Date(now.getTime() + 7 * dayMs),
      },
      status: DocumentStatus.APPROVED,
    },
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  for (const document of upcomingDocs) {
    const message = [
      `Your ${document.type.toLowerCase()} document will expire on ${document.effectiveTo?.toDateString()}.`,
      'Upload an updated document now to avoid badge removal.',
    ].join('\n');

    if (document.user?.email) {
      notify('document_expiring_soon', {
        to: document.user.email,
        type: document.type,
        effectiveTo: document.effectiveTo ?? new Date(),
      }).catch((error) => {
        console.error('Failed to send document expiring email', error);
      });
    }

    await notificationService.createInAppNotification(document.userId, 'DOCUMENT_EXPIRING_SOON', {
      documentId: document.id,
      expiresAt: document.effectiveTo,
    });
  }

  return expiredDocs.length;
}

export async function overrideKycStatus(
  userId: string,
  verified: boolean,
  prisma: PrismaClient = prismaClient,
) {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
  });
  if (!contractor) {
    throw new Error('Contractor not found');
  }

  const updated = await prisma.contractor.update({
    where: { id: contractor.id },
    data: {
      verifiedKyc: verified,
    },
  });

  await notificationService.createInAppNotification(userId, 'DOCUMENT_APPROVED', {
    type: 'KYC',
    verified,
  });

  return updated;
}

