import { randomUUID } from 'crypto';
import { Prisma, PrismaClient, Role, EvidenceFile } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { getCdnBaseUrl, getUploadBaseUrl } from '../utils/uploads';

type EvidenceUploadUrl = {
  uploadUrl: string;
  fileUrl: string;
  fields: Record<string, string>;
};

type CreateEvidenceInput = {
  milestoneId: string;
  fileUrl: string;
  type: string;
  contentHash?: string | null;
};

const ensureMilestoneAccess = async (
  prisma: PrismaClient,
  milestoneId: string,
  userId: string,
) => {
  const [milestone, user] = await Promise.all([
    prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        job: {
          include: {
            contractor: { include: { user: true } },
            homeowner: { include: { user: true } },
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    }),
  ]);

  if (!milestone) {
    throw new Error('Milestone not found');
  }
  if (!milestone.job) {
    throw new Error('Job not found for milestone');
  }
  if (!user) {
    throw new Error('User not found');
  }

  const isAdmin = user.role === Role.ADMIN;
  const isContractor = milestone.job.contractor?.userId === userId;
  const isHomeowner = milestone.job.homeowner?.userId === userId;

  if (!isAdmin && !isContractor && !isHomeowner) {
    throw new Error('Forbidden');
  }

  return { milestone, job: milestone.job, user };
};

export const createEvidenceUploadUrl = async (
  userId: string,
  milestoneId: string,
  mimeType?: string,
  prisma: PrismaClient = prismaClient,
): Promise<EvidenceUploadUrl> => {
  const { job } = await ensureMilestoneAccess(prisma, milestoneId, userId);

  const key = `evidence/${job.id}/${milestoneId}/${Date.now()}-${randomUUID()}`;
  const uploadUrl = `${getUploadBaseUrl()}/${key}`;
  const fileUrl = `${getCdnBaseUrl()}/${key}`;

  const fields: Record<string, string> = {
    'x-amz-meta-job-id': job.id,
    'x-amz-meta-milestone-id': milestoneId,
    'x-amz-meta-uploader': userId,
  };

  if (mimeType) {
    fields['Content-Type'] = mimeType;
  }

  return { uploadUrl, fileUrl, fields };
};

export const recordEvidence = async (
  userId: string,
  input: CreateEvidenceInput,
  prisma: PrismaClient = prismaClient,
): Promise<{ evidence: EvidenceFile; duplicate: boolean }> => {
  const { milestone } = await ensureMilestoneAccess(prisma, input.milestoneId, userId);

  if (input.contentHash) {
    const existing = await prisma.evidenceFile.findFirst({
      where: {
        milestoneId: milestone.id,
        contentHash: input.contentHash,
      },
    });
    if (existing) {
      return { evidence: existing, duplicate: true };
    }
  }

  const created = await prisma.evidenceFile.create({
    data: {
      milestoneId: milestone.id,
      uploaderUserId: userId,
      url: input.fileUrl,
      type: input.type,
      contentHash: input.contentHash ?? null,
    },
  });

  return { evidence: created, duplicate: false };
};

export const listEvidenceForMilestone = async (
  userId: string,
  milestoneId: string,
  prisma: PrismaClient = prismaClient,
) => {
  await ensureMilestoneAccess(prisma, milestoneId, userId);

  return prisma.evidenceFile.findMany({
    where: { milestoneId },
    orderBy: { createdAt: 'asc' },
  });
};
