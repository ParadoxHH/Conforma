import { beforeEach, describe, expect, it } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient, Role } from '@prisma/client';

import {
  createEvidenceUploadUrl,
  recordEvidence,
} from '../src/services/evidence.service';

describe('evidence.service', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  const baseMilestone = {
    id: 'milestone-1',
    job: {
      id: 'job-1',
      contractor: {
        userId: 'contractor-user',
        user: { id: 'contractor-user', role: Role.CONTRACTOR },
      },
      homeowner: {
        userId: 'homeowner-user',
        user: { id: 'homeowner-user', role: Role.HOMEOWNER },
      },
    },
  };

  const baseUser = { id: 'contractor-user', role: Role.CONTRACTOR };

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    prisma.milestone.findUnique.mockResolvedValue(baseMilestone as any);
    prisma.user.findUnique.mockResolvedValue(baseUser as any);
    prisma.riskConfig.findUnique?.mockReset?.();
  });

  it('returns duplicate evidence when content hash already exists', async () => {
    const existingEvidence = { id: 'evidence-1' };
    prisma.evidenceFile.findFirst.mockResolvedValue(existingEvidence as any);

    const result = await recordEvidence(
      'contractor-user',
      {
        milestoneId: 'milestone-1',
        fileUrl: 'https://cdn/file.jpg',
        type: 'IMAGE',
        contentHash: 'hash',
      },
      prisma,
    );

    expect(result.duplicate).toBe(true);
    expect(result.evidence).toEqual(existingEvidence);
    expect(prisma.evidenceFile.create).not.toHaveBeenCalled();
  });

  it('creates new evidence when no duplicate is found', async () => {
    prisma.evidenceFile.findFirst.mockResolvedValue(null);
    prisma.evidenceFile.create.mockResolvedValue({ id: 'new-evidence' } as any);

    const result = await recordEvidence(
      'contractor-user',
      {
        milestoneId: 'milestone-1',
        fileUrl: 'https://cdn/file.jpg',
        type: 'IMAGE',
        contentHash: 'hash',
      },
      prisma,
    );

    expect(result.duplicate).toBe(false);
    expect(result.evidence.id).toBe('new-evidence');
    expect(prisma.evidenceFile.create).toHaveBeenCalledWith({
      data: {
        milestoneId: 'milestone-1',
        uploaderUserId: 'contractor-user',
        url: 'https://cdn/file.jpg',
        type: 'IMAGE',
        contentHash: 'hash',
      },
    });
  });

  it('issues upload url with milestone context', async () => {
    const upload = await createEvidenceUploadUrl(
      'contractor-user',
      'milestone-1',
      'image/png',
      prisma,
    );

    expect(upload.fileUrl).toContain('milestone-1');
    expect(upload.uploadUrl).toContain('milestone-1');
    expect(upload.fields['x-amz-meta-milestone-id']).toBe('milestone-1');
    expect(upload.fields['Content-Type']).toBe('image/png');
  });
});
