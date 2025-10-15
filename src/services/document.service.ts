import { randomUUID } from 'crypto';
import {
  DocumentStatus,
  DocumentType,
  PrismaClient,
  Role,
} from '@prisma/client';
import prismaClient from '../lib/prisma';
import * as notificationService from './notification.service';

const DEFAULT_UPLOAD_BASE_URL = 'https://uploads.conforma.com';
const DEFAULT_CDN_BASE_URL = 'https://cdn.conforma.com';

function resolveUploadBaseUrl() {
  return process.env.FILE_UPLOAD_BASE_URL ?? DEFAULT_UPLOAD_BASE_URL;
}

function resolveCdnBaseUrl() {
  return process.env.FILE_CDN_BASE_URL ?? DEFAULT_CDN_BASE_URL;
}

export async function createUploadUrl(
  userId: string,
  type: DocumentType,
) {
  const key = `verification/${userId}/${type.toLowerCase()}-${randomUUID()}`;
  const baseUploadUrl = resolveUploadBaseUrl();
  const cdnBaseUrl = resolveCdnBaseUrl();

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
    },
  });

  await notificationService.createInAppNotification(userId, 'DOCUMENT_UPLOADED', {
    documentId: document.id,
    type,
  });

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
      notes: `Approved by ${reviewerUserId} at ${new Date().toISOString()}`,
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
