import { PrismaClient, Trade } from '@prisma/client';
import prismaClient from '../lib/prisma';
import { calculateDistanceMiles, getZipsWithinRadius, isKnownZip } from '../utils/geo';

type MatchParams = {
  trade?: string;
  zip?: string;
  radius?: number;
  limit?: number;
  budget?: number;
};

type MatchingScore = {
  contractorId: string;
  score: number;
  reasons: string[];
  distanceMiles?: number | null;
  contractor: {
    companyName: string | null;
    ratingAvg: number;
    ratingCount: number;
    subscriptionTier: "FREE" | "PRO" | "VERIFIED";
    verified: boolean;
    serviceAreas: string[];
    instantPayoutEnabled: boolean;
    trades: Trade[];
  };
};

const normalizeTrade = (trade?: string): Trade | undefined => {
  if (!trade) {
    return undefined;
  }
  const upper = trade.toUpperCase().replace('-', '_');
  return Trade[upper as keyof typeof Trade];
};

export const findBestContractorMatches = async (
  params: MatchParams,
  prisma: PrismaClient = prismaClient,
): Promise<MatchingScore[]> => {
  const tradeEnum = normalizeTrade(params.trade);
  const radius = params.radius ?? 25;
  const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 20) : 5;
  const zipList = params.zip && radius && radius > 0 && isKnownZip(params.zip)
    ? getZipsWithinRadius(params.zip, radius)
    : params.zip
    ? [params.zip]
    : [];

  const contractors = await prisma.contractor.findMany({
    where: {
      ...(tradeEnum ? { trades: { has: tradeEnum } } : {}),
      ...(zipList.length > 0
        ? {
            OR: zipList.map((zip) => ({ serviceAreas: { has: zip } })),
          }
        : {}),
      subscriptionStatus: { not: 'CANCELED' },
    },
  });

  const scored = contractors.map((contractor) => {
    const reasons: string[] = [];
    let score = 0;

    const rating = Number(contractor.ratingAvg ?? 0);
    const ratingCount = contractor.ratingCount ?? 0;

    if (contractor.verifiedKyc && contractor.verifiedLicense && contractor.verifiedInsurance) {
      score += 35;
      reasons.push('Fully verified contractor');
    } else if (contractor.verifiedKyc || contractor.verifiedLicense || contractor.verifiedInsurance) {
      score += 15;
      reasons.push('Partially verified credentials on file');
    }

    if (rating > 0) {
      score += rating * 10;
      reasons.push(`High homeowner rating (${rating.toFixed(1)}/5)`);
    }

    if (ratingCount >= 15) {
      score += 8;
      reasons.push('Responds consistently with 15+ completed reviews');
    }

    if (contractor.subscriptionTier === "VERIFIED") {
      score += 25;
      reasons.push('Verified tier contractor (priority routing)');
    } else if (contractor.subscriptionTier === "PRO") {
      score += 12;
      reasons.push('Pro tier subscriber with analytics & boost');
    }

    if (contractor.instantPayoutEnabled) {
      score += 5;
      reasons.push('Offers instant payout for faster cash flow');
    }

    let distanceMiles: number | null | undefined;
    if (params.zip) {
      const primaryZip = contractor.serviceAreas.find((zip) => zipList.includes(zip)) ?? contractor.serviceAreas[0];
      distanceMiles = primaryZip ? calculateDistanceMiles(params.zip, primaryZip) : null;
      if (distanceMiles !== null && distanceMiles !== undefined && radius) {
        if (distanceMiles <= radius) {
          score += Math.max(10 - Math.min(distanceMiles, 10), 2);
          reasons.push(`Within ${Math.round(distanceMiles)} miles of project zip`);
        } else {
          score -= Math.min(distanceMiles / 2, 10);
        }
      }
    }

    if (params.budget && params.budget >= 0) {
      reasons.push(`Comfortable around $${Math.round(params.budget).toLocaleString()} budgets`);
    }

    return {
      contractorId: contractor.id,
      score,
      reasons,
      distanceMiles,
      contractor: {
        companyName: contractor.companyName,
        ratingAvg: Number(contractor.ratingAvg ?? 0),
        ratingCount: contractor.ratingCount ?? 0,
        subscriptionTier: contractor.subscriptionTier,
        verified: contractor.verifiedKyc && contractor.verifiedLicense && contractor.verifiedInsurance,
        serviceAreas: contractor.serviceAreas,
        instantPayoutEnabled: contractor.instantPayoutEnabled,
        trades: contractor.trades,
      },
    };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result, index) => ({
      ...result,
      score: Math.round(result.score + (limit - index)),
    }));
};




