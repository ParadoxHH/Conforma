const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes'].includes(value.toLowerCase());
};

export const appConfig = {
  platformFeeBps: parseNumber(process.env.PLATFORM_FEE_BPS, 150),
  instantPayoutEnabled: parseBoolean(process.env.INSTANT_PAYOUT_ENABLED, true),
  instantPayoutFeeBps: parseNumber(process.env.INSTANT_PAYOUT_FEE_BPS, 100),
  aiTriageEnabled: parseBoolean(process.env.AI_TRIAGE_ENABLED, false),
  aiProvider: process.env.AI_PROVIDER ?? 'openai',
  accountingExportCurrency: process.env.ACCOUNTING_EXPORT_CURRENCY ?? 'USD',
  allowedStates: (process.env.ALLOWED_STATES ?? 'TX')
    .split(',')
    .map((state) => state.trim().toUpperCase())
    .filter((state) => state.length > 0),
  stripe: {
    secretKey: process.env.STRIPE_SECRET ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    priceMap: {
      PRO: process.env.STRIPE_PRICE_PRO ?? '',
      VERIFIED: process.env.STRIPE_PRICE_VERIFIED ?? '',
    },
    successUrl: process.env.STRIPE_SUCCESS_URL ?? `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/dashboard/billing?success=true`,
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? `${process.env.FRONTEND_URL ?? 'http://localhost:3001'}/dashboard/billing?canceled=true`,
  },
};

export type SubscriptionPlanTier = 'FREE' | 'PRO' | 'VERIFIED';

export type SubscriptionPlanDefinition = {
  tier: SubscriptionPlanTier;
  name: string;
  priceMonthly: number;
  priceId?: string;
  badge?: string;
  description: string;
  features: string[];
  perks: string[];
  instantPayoutIncluded: boolean;
  highlight: boolean;
};

export const subscriptionPlans: SubscriptionPlanDefinition[] = [
  {
    tier: 'FREE',
    name: 'Free',
    priceMonthly: 0,
    description: 'Get listed in Conforma search and run escrow jobs with the standard fee.',
    features: [
      'Basic profile listing',
      'Escrowed payments with standard release times',
      'In-app messaging & file sharing',
    ],
    perks: ['Access homeowner leads (manual request)', 'Standard payout timing'],
    instantPayoutIncluded: false,
    highlight: false,
  },
  {
    tier: 'PRO',
    name: 'Pro',
    priceMonthly: 149,
    priceId: process.env.STRIPE_PRICE_PRO,
    badge: 'Most Popular',
    description: 'Stand out in homeowner search with profile enhancements and analytics.',
    features: [
      'Profile highlight & search boost',
      'Lead routing priority within your service areas',
      'Contractor analytics dashboard',
      '10% faster payout release SLA',
    ],
    perks: ['Eligible for instant payout add-on', 'Phone & SMS support'],
    instantPayoutIncluded: false,
    highlight: true,
  },
  {
    tier: 'VERIFIED',
    name: 'Verified',
    priceMonthly: 299,
    priceId: process.env.STRIPE_PRICE_VERIFIED,
    badge: 'Best ROI',
    description: 'Verified contractors get priority routing, badges, and reduced platform fees.',
    features: [
      'Verified badge & top search placement',
      'Reduced platform service fee tier',
      'Instant payout fee discount',
      'Quarterly growth consult with Conforma team',
    ],
    perks: ['Dedicated account manager', 'Priority dispute mediation'],
    instantPayoutIncluded: true,
    highlight: false,
  },
];

export type FeeBreakdown = {
  platformFee: number;
  escrowFees: number;
  instantPayoutFee: number;
  totalFees: number;
  netPayout: number;
  currency: string;
};

export const defaultFeeBreakdown = (): FeeBreakdown => ({
  platformFee: 0,
  escrowFees: 0,
  instantPayoutFee: 0,
  totalFees: 0,
  netPayout: 0,
  currency: appConfig.accountingExportCurrency,
});



