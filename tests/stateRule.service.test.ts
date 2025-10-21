import { describe, expect, it, beforeEach } from 'vitest';
import { mockDeep, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';

import { getStateRule, listStateRules, upsertStateRule } from '../src/services/stateRule.service';

describe('stateRule.service', () => {
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
  });

  it('returns an existing state rule when found', async () => {
    prisma.stateRule.findUnique.mockResolvedValue({
      code: 'CA',
      name: 'California',
      reviewWindowMidDays: 4,
      reviewWindowFinalDays: 7,
      platformFeeBps: 140,
      kycRequired: true,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    });

    const rule = await getStateRule('ca', prisma);

    expect(rule.code).toBe('CA');
    expect(rule.name).toBe('California');
    expect(rule.reviewWindowMidDays).toBe(4);
    expect(rule.reviewWindowFinalDays).toBe(7);
    expect(prisma.stateRule.findUnique).toHaveBeenCalledWith({ where: { code: 'CA' } });
  });

  it('falls back to default template when rule is missing', async () => {
    prisma.stateRule.findUnique.mockResolvedValue(null);

    const rule = await getStateRule('wa', prisma);

    expect(rule.code).toBe('WA');
    expect(rule.name).toBe('WA');
    expect(rule.reviewWindowMidDays).toBe(3);
    expect(rule.reviewWindowFinalDays).toBe(5);
    expect(rule.platformFeeBps).toBe(150);
    expect(rule.kycRequired).toBe(false);
  });

  it('lists rules for allowed states preserving requested order', async () => {
    prisma.stateRule.findMany.mockResolvedValue([
      {
        code: 'TX',
        name: 'Texas',
        reviewWindowMidDays: 3,
        reviewWindowFinalDays: 5,
        platformFeeBps: 150,
        kycRequired: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const rules = await listStateRules(['tx', 'wa'], prisma);

    expect(rules).toHaveLength(2);
    expect(rules[0].code).toBe('TX');
    expect(rules[1].code).toBe('WA'); // fallback entry
    expect(prisma.stateRule.findMany).toHaveBeenCalledWith({ where: { code: { in: ['TX', 'WA'] } } });
  });

  it('upserts rules with normalized code', async () => {
    prisma.stateRule.upsert.mockResolvedValue({
      code: 'LA',
      name: 'Louisiana',
      reviewWindowMidDays: 5,
      reviewWindowFinalDays: 7,
      platformFeeBps: 160,
      kycRequired: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await upsertStateRule(
      'la',
      {
        name: 'Louisiana',
        reviewWindowMidDays: 5,
        reviewWindowFinalDays: 7,
        platformFeeBps: 160,
        kycRequired: true,
      },
      prisma,
    );

    expect(prisma.stateRule.upsert).toHaveBeenCalledWith({
      where: { code: 'LA' },
      update: {
        name: 'Louisiana',
        reviewWindowMidDays: 5,
        reviewWindowFinalDays: 7,
        platformFeeBps: 160,
        kycRequired: true,
      },
      create: {
        code: 'LA',
        name: 'Louisiana',
        reviewWindowMidDays: 5,
        reviewWindowFinalDays: 7,
        platformFeeBps: 160,
        kycRequired: true,
      },
    });
  });
});
