import { PrismaClient, Role } from '@prisma/client';
import prismaClient from '../lib/prisma';
import * as notificationService from './notification.service';

type CreateReviewInput = {
  rating: number;
  comment?: string | null;
};

type Pagination = {
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

async function assertHomeownerOwnsCompletedJob(
  jobId: string,
  userId: string,
  prisma: PrismaClient,
) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      status: true,
      contractorId: true,
      contractor: { select: { userId: true } },
      homeowner: { select: { userId: true } },
    },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  if (job.homeowner.userId !== userId) {
    throw new Error('Forbidden');
  }

  if (job.status !== 'COMPLETED') {
    throw new Error('Job not completed');
  }

  return job;
}

export async function createReview(
  jobId: string,
  user: { id: string; role: Role },
  input: CreateReviewInput,
  prisma: PrismaClient = prismaClient,
) {
  if (user.role !== Role.HOMEOWNER) {
    throw new Error('Only homeowners can review jobs');
  }

  const job = await assertHomeownerOwnsCompletedJob(jobId, user.id, prisma);

  const existing = await prisma.review.findFirst({
    where: {
      jobId,
      homeowner: {
        userId: user.id,
      },
    },
  });

  if (existing) {
    throw new Error('Review already exists');
  }

  const result = await prisma.$transaction(async (tx) => {
    const homeowner = await tx.homeowner.findUnique({
      where: { userId: user.id },
    });
    if (!homeowner) {
      throw new Error('Homeowner profile missing');
    }

    const review = await tx.review.create({
      data: {
        jobId,
        contractorId: job.contractorId,
        homeownerId: homeowner.id,
        rating: input.rating,
        comment: input.comment ?? null,
      },
    });

    const aggregates = await tx.review.aggregate({
      where: { contractorId: job.contractorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.contractor.update({
      where: { id: job.contractorId },
      data: {
        ratingAvg: Number(aggregates._avg.rating?.toFixed(2) ?? 0),
        ratingCount: aggregates._count.rating,
      },
    });

    return review;
  });

  await notificationService.createInAppNotification(job.contractor.userId, 'REVIEW_POSTED', {
    jobId,
    reviewId: result.id,
    rating: input.rating,
  });

  return result;
}

export async function listContractorReviews(
  contractorId: string,
  params: Pagination = {},
  prisma: PrismaClient = prismaClient,
) {
  const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE;
  const pageSize =
    params.pageSize && params.pageSize > 0 && params.pageSize <= 50
      ? params.pageSize
      : DEFAULT_PAGE_SIZE;

  const [total, reviews] = await prisma.$transaction([
    prisma.review.count({ where: { contractorId } }),
    prisma.review.findMany({
      where: { contractorId },
      include: {
        homeowner: {
          select: {
            displayName: true,
            allowAlias: true,
            user: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    total,
    page,
    pageSize,
    reviews: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      homeowner: {
        displayName: review.homeowner.allowAlias
          ? review.homeowner.displayName ?? 'Verified Homeowner'
          : null,
        avatarUrl: review.homeowner.user.avatarUrl,
      },
    })),
  };
}
