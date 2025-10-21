import { PrismaClient, StateRule } from '@prisma/client';
import prismaClient from '../lib/prisma';

export type UpsertStateRuleInput = {
  name: string;
  reviewWindowMidDays: number;
  reviewWindowFinalDays: number;
  platformFeeBps: number;
  kycRequired: boolean;
};

const normalizeCode = (code: string): string => code.trim().toUpperCase();

const buildFallbackRule = (code: string): StateRule => {
  const normalized = normalizeCode(code);
  const now = new Date();
  return {
    code: normalized,
    name: normalized,
    reviewWindowMidDays: 3,
    reviewWindowFinalDays: 5,
    platformFeeBps: 150,
    kycRequired: false,
    createdAt: now,
    updatedAt: now,
  };
};

export const getStateRule = async (
  code: string,
  prisma: PrismaClient = prismaClient,
): Promise<StateRule> => {
  const normalized = normalizeCode(code);
  const existing = await prisma.stateRule.findUnique({ where: { code: normalized } });
  return existing ?? buildFallbackRule(normalized);
};

export const listStateRules = async (
  codes: string[],
  prisma: PrismaClient = prismaClient,
): Promise<StateRule[]> => {
  const normalizedCodes = codes.map(normalizeCode);
  if (normalizedCodes.length === 0) {
    return [];
  }

  const records = await prisma.stateRule.findMany({
    where: { code: { in: normalizedCodes } },
  });
  const recordMap = new Map(records.map((record) => [record.code, record]));

  return normalizedCodes.map((code) => recordMap.get(code) ?? buildFallbackRule(code));
};

export const upsertStateRule = async (
  code: string,
  input: UpsertStateRuleInput,
  prisma: PrismaClient = prismaClient,
): Promise<StateRule> => {
  const normalized = normalizeCode(code);
  const { name, reviewWindowMidDays, reviewWindowFinalDays, platformFeeBps, kycRequired } = input;

  return prisma.stateRule.upsert({
    where: { code: normalized },
    update: { name, reviewWindowMidDays, reviewWindowFinalDays, platformFeeBps, kycRequired },
    create: { code: normalized, name, reviewWindowMidDays, reviewWindowFinalDays, platformFeeBps, kycRequired },
  });
};
