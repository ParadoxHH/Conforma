import { PrismaClient, Role, Trade } from '@prisma/client';
import prismaClient from '../lib/prisma';

type UpdateContractorPayload = {
  avatarUrl?: string | null;
  bio?: string | null;
  companyName?: string | null;
  serviceAreas?: string[];
  trades?: Trade[];
  portfolio?: unknown;
};

type UpdateHomeownerPayload = {
  avatarUrl?: string | null;
  bio?: string | null;
  displayName?: string | null;
  allowAlias?: boolean;
};

export async function getCurrentProfile(
  userId: string,
  prisma: PrismaClient = prismaClient,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      contractor: {
        select: {
          id: true,
          companyName: true,
          trade: true,
          trades: true,
          serviceAreas: true,
          portfolio: true,
          verifiedKyc: true,
          verifiedLicense: true,
          verifiedInsurance: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
      homeowner: {
        select: {
          id: true,
          address: true,
          city: true,
          state: true,
          zip: true,
          phoneNumber: true,
          displayName: true,
          allowAlias: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function updateProfile(
  userId: string,
  role: Role,
  payload: UpdateContractorPayload | UpdateHomeownerPayload,
  prisma: PrismaClient = prismaClient,
) {
  if (role === Role.CONTRACTOR) {
    const contractorPayload = payload as UpdateContractorPayload;
    const updateUserData: Record<string, unknown> = {};
    if (contractorPayload.avatarUrl !== undefined) {
      updateUserData.avatarUrl = contractorPayload.avatarUrl;
    }
    if (contractorPayload.bio !== undefined) {
      updateUserData.bio = contractorPayload.bio;
    }

    const contractor = await prisma.contractor.update({
      where: { userId },
      data: {
        companyName: contractorPayload.companyName ?? undefined,
        serviceAreas: contractorPayload.serviceAreas ?? undefined,
        trades: contractorPayload.trades ?? undefined,
        portfolio: contractorPayload.portfolio ?? undefined,
      },
      include: {
        user: true,
      },
    });

    if (Object.keys(updateUserData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateUserData,
      });
    }

    return contractor;
  }

  const homeownerPayload = payload as UpdateHomeownerPayload;
  const updateUserData: Record<string, unknown> = {};
  if (homeownerPayload.avatarUrl !== undefined) {
    updateUserData.avatarUrl = homeownerPayload.avatarUrl;
  }
  if (homeownerPayload.bio !== undefined) {
    updateUserData.bio = homeownerPayload.bio;
  }

  const homeowner = await prisma.homeowner.update({
    where: { userId },
    data: {
      displayName: homeownerPayload.displayName ?? undefined,
      allowAlias: homeownerPayload.allowAlias ?? undefined,
    },
    include: {
      user: true,
    },
  });

  if (Object.keys(updateUserData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: updateUserData,
    });
  }

  return homeowner;
}

export async function getContractorPublicProfile(
  contractorId: string,
  prisma: PrismaClient = prismaClient,
) {
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    include: {
      user: {
        select: {
          avatarUrl: true,
          bio: true,
        },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        include: {
          homeowner: {
            select: {
              id: true,
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
        take: 10,
      },
    },
  });

  if (!contractor) {
    throw new Error('Contractor not found');
  }

  const reviews = contractor.reviews.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    homeowner: {
      id: review.homeowner.id,
      displayName: review.homeowner.allowAlias
        ? review.homeowner.displayName ?? 'Verified Homeowner'
        : null,
      avatarUrl: review.homeowner.user.avatarUrl,
    },
  }));

  return {
    id: contractor.id,
    companyName: contractor.companyName,
    trades: contractor.trades,
    serviceAreas: contractor.serviceAreas,
    portfolio: contractor.portfolio,
    ratingAvg: Number(contractor.ratingAvg),
    ratingCount: contractor.ratingCount,
    badges: {
      kyc: contractor.verifiedKyc,
      license: contractor.verifiedLicense,
      insurance: contractor.verifiedInsurance,
    },
    avatarUrl: contractor.user?.avatarUrl ?? null,
    bio: contractor.user?.bio ?? null,
    reviews,
  };
}
