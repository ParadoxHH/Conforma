import { Prisma, PrismaClient, Trade } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { calculateDistanceMiles, getZipsWithinRadius, isKnownZip } from '../utils/geo';

export type ContractorSearchSort = 'rating' | 'distance' | 'recency';

export type ContractorSearchParams = {
  trade?: string;
  zip?: string;
  radius?: number;
  verified?: boolean;
  minRating?: number;
  q?: string;
  page?: number;
  pageSize?: number;
  sort?: ContractorSearchSort;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

function normalizeTrade(trade?: string): Trade | undefined {
  if (!trade) {
    return undefined;
  }
  const upper = trade.toUpperCase().replace('-', '_');
  return Trade[upper as keyof typeof Trade];
}

function sanitizeQuery(text?: string): string | undefined {
  if (!text) {
    return undefined;
  }
  return text.trim();
}

function buildWhereClause(params: ContractorSearchParams): Prisma.ContractorWhereInput {
  const and: Prisma.ContractorWhereInput[] = [];

  const tradeEnum = normalizeTrade(params.trade);
  if (tradeEnum) {
    and.push({
      trades: {
        has: tradeEnum,
      },
    });
  }

  if (params.verified) {
    and.push(
      { verifiedKyc: true },
      { verifiedLicense: true },
      { verifiedInsurance: true },
    );
  }

  if (params.minRating && params.minRating > 0) {
    and.push({
      ratingAvg: {
        gte: params.minRating,
      },
      ratingCount: {
        gt: 0,
      },
    });
  }

  const q = sanitizeQuery(params.q);
  if (q) {
    and.push({
      OR: [
        { companyName: { contains: q, mode: 'insensitive' } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
        { user: { bio: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }

  if (params.zip) {
    if (params.radius && params.radius > 0 && isKnownZip(params.zip)) {
      const allowedZips = getZipsWithinRadius(params.zip, params.radius);
      if (allowedZips.length > 0) {
        and.push({
          serviceAreas: {
            hasSome: allowedZips,
          },
        });
      }
    } else {
      and.push({
        serviceAreas: {
          has: params.zip,
        },
      });
    }
  }

  if (!and.length) {
    return {};
  }

  return { AND: and };
}

type ContractorSummary = {
  id: string;
  companyName: string | null;
  trades: Trade[];
  ratingAvg: number;
  ratingCount: number;
  verifiedKyc: boolean;
  verifiedLicense: boolean;
  verifiedInsurance: boolean;
  serviceAreas: string[];
  distanceMiles?: number | null;
  badges: {
    kyc: boolean;
    license: boolean;
    insurance: boolean;
  };
  avatarUrl: string | null;
  tagline: string | null;
};

function computeSort(sort?: ContractorSearchSort): ContractorSearchSort {
  if (!sort) {
    return 'rating';
  }
  return sort;
}

function findDistance(contractor: ContractorSummary, originZip?: string): number | null {
  if (!originZip || contractor.serviceAreas.length === 0) {
    return null;
  }

  let minDistance: number | null = null;
  for (const zip of contractor.serviceAreas) {
    const distance = calculateDistanceMiles(originZip, zip);
    if (distance === null) {
      continue;
    }
    if (minDistance === null || distance < minDistance) {
      minDistance = distance;
    }
  }
  return minDistance;
}

export async function searchContractors(
  params: ContractorSearchParams,
  prisma: PrismaClient = prismaClient,
) {
  const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE;
  const pageSize =
    params.pageSize && params.pageSize > 0 && params.pageSize <= 100
      ? params.pageSize
      : DEFAULT_PAGE_SIZE;

  const where = buildWhereClause(params);
  const sort = computeSort(params.sort);

  const orderBy: Prisma.ContractorOrderByWithRelationInput[] = [];
  if (sort === 'rating') {
    orderBy.push({ ratingAvg: 'desc' }, { ratingCount: 'desc' }, { user: { createdAt: 'desc' } });
  } else if (sort === 'recency') {
    orderBy.push({ user: { createdAt: 'desc' } });
  } else if (sort === 'distance') {
    orderBy.push({ ratingAvg: 'desc' });
  }

  const [total, contractors] = await prisma.$transaction([
    prisma.contractor.count({ where }),
    prisma.contractor.findMany({
      where,
      include: {
        user: {
          select: {
            avatarUrl: true,
            bio: true,
            createdAt: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const summaries: ContractorSummary[] = contractors.map((contractor) => {
    const summary: ContractorSummary = {
      id: contractor.id,
      companyName: contractor.companyName,
      trades: contractor.trades as Trade[],
      ratingAvg: Number(contractor.ratingAvg),
      ratingCount: contractor.ratingCount,
      verifiedKyc: contractor.verifiedKyc,
      verifiedLicense: contractor.verifiedLicense,
      verifiedInsurance: contractor.verifiedInsurance,
      serviceAreas: contractor.serviceAreas,
      badges: {
        kyc: contractor.verifiedKyc,
        license: contractor.verifiedLicense,
        insurance: contractor.verifiedInsurance,
      },
      avatarUrl: contractor.user?.avatarUrl ?? null,
      tagline: contractor.user?.bio ?? null,
    };

    summary.distanceMiles = findDistance(summary, params.zip);

    return summary;
  });

  if (sort === 'distance') {
    summaries.sort((a, b) => {
      if (a.distanceMiles === null || a.distanceMiles === undefined) {
        return 1;
      }
      if (b.distanceMiles === null || b.distanceMiles === undefined) {
        return -1;
      }
      return a.distanceMiles - b.distanceMiles;
    });
  }

  return {
    total,
    page,
    pageSize,
    results: summaries,
  };
}

export async function getContractorsForIndex(prisma: PrismaClient = prismaClient) {
  const contractors = await prisma.contractor.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          avatarUrl: true,
          bio: true,
          createdAt: true,
        },
      },
    },
  });

  return contractors.map((contractor) => ({
    id: contractor.id,
    userId: contractor.userId,
    companyName: contractor.companyName,
    trades: contractor.trades,
    serviceAreas: contractor.serviceAreas,
    ratingAvg: Number(contractor.ratingAvg),
    ratingCount: contractor.ratingCount,
    verifiedKyc: contractor.verifiedKyc,
    verifiedLicense: contractor.verifiedLicense,
    verifiedInsurance: contractor.verifiedInsurance,
    createdAt: contractor.user?.createdAt ?? null,
    avatarUrl: contractor.user?.avatarUrl ?? null,
    bio: contractor.user?.bio ?? null,
  }));
}
