import { PrismaClient, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import Stripe from 'stripe';
import prismaClient from '../lib/prisma';
import { appConfig, subscriptionPlans, SubscriptionPlanDefinition } from '../config/app.config';
import { getReferralSummary, redeemReferralCredit } from './referral.service';
import { getStripe, isStripeConfigured } from '../lib/stripe';

type SubscribeInput = {
  plan: SubscriptionTier.PRO | SubscriptionTier.VERIFIED;
  paymentMethodId?: string;
  successUrl?: string;
  cancelUrl?: string;
};

type BillingSummary = {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  renewalAt: Date | null;
  instantPayoutEnabled: boolean;
  instantPayoutEligible: boolean;
  platformFeeBps: number;
  instantPayoutFeeBps: number;
  stripeCustomerPortalUrl?: string;
  stripeSubscriptionId?: string | null;
};

const getPlanDefinition = (tier: SubscriptionTier): SubscriptionPlanDefinition => {
  const plan = subscriptionPlans.find((item) => item.tier === tier);
  if (!plan) {
    throw new Error(`Unknown subscription tier: ${tier}`);
  }
  return plan;
};

export const listPlans = () => {
  return subscriptionPlans.map((plan) => ({
    tier: plan.tier,
    name: plan.name,
    priceMonthly: plan.priceMonthly,
    badge: plan.badge,
    description: plan.description,
    features: plan.features,
    perks: plan.perks,
    instantPayoutIncluded: plan.instantPayoutIncluded,
    highlight: plan.highlight,
    priceId: plan.priceId ?? null,
  }));
};

export const getBillingSummary = async (
  userId: string,
  prisma: PrismaClient = prismaClient,
): Promise<BillingSummary> => {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (!contractor) {
    throw new Error('Contractor profile not found.');
  }

  const feeBps = getFeeBpsForTier(contractor.subscriptionTier);
  const instantPayoutFeeBps =
    contractor.subscriptionTier === SubscriptionTier.VERIFIED
      ? Math.max(appConfig.instantPayoutFeeBps - 50, 25)
      : appConfig.instantPayoutFeeBps;

  const summary: BillingSummary = {
    tier: contractor.subscriptionTier,
    status: contractor.subscriptionStatus,
    renewalAt: contractor.subscriptionRenewalAt,
    instantPayoutEnabled: contractor.instantPayoutEnabled,
    instantPayoutEligible: contractor.subscriptionTier !== SubscriptionTier.FREE,
    platformFeeBps: feeBps,
    instantPayoutFeeBps,
    stripeCustomerPortalUrl: undefined,
    stripeSubscriptionId: contractor.stripeSubscriptionId,
  };

  if (isStripeConfigured() && contractor.stripeCustomerId) {
    const stripe = getStripe();
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: contractor.stripeCustomerId,
      return_url: appConfig.stripe.successUrl,
    });
    summary.stripeCustomerPortalUrl = portalSession.url;
  }

  return summary;
};

export const subscribe = async (
  userId: string,
  input: SubscribeInput,
  prisma: PrismaClient = prismaClient,
) => {
  const contractor = await prisma.contractor.findUnique({
    where: { userId },
  });

  if (!contractor) {
    throw new Error('Contractor profile not found.');
  }

  const plan = getPlanDefinition(input.plan);

  if (referralCredits > 0) {\n    await redeemReferralCredit(user.id, prisma);\n    await prisma.contractor.update({\n      where: { id: contractor.id },\n      data: {\n        subscriptionTier: plan.tier,\n        subscriptionStatus: SubscriptionStatus.ACTIVE,\n        instantPayoutEnabled: plan.instantPayoutIncluded || contractor.instantPayoutEnabled,\n        subscriptionRenewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),\n      },\n    });\n\n    return {\n      activation: 'referral-credit',\n      checkoutUrl: null,\n      creditsRemaining: referralCredits - 1,\n    };\n  }\n\n  if (!isStripeConfigured() || !plan.priceId) {
    await prisma.contractor.update({
      where: { id: contractor.id },
      data: {
        subscriptionTier: plan.tier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        instantPayoutEnabled: plan.instantPayoutIncluded || contractor.instantPayoutEnabled,
        subscriptionRenewalAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      activation: 'local',
      checkoutUrl: null,
    };
  }

  const stripe = getStripe();

  let customerId = contractor.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: contractor.user?.email,
      metadata: {
        contractorId: contractor.id,
      },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: input.successUrl ?? appConfig.stripe.successUrl,
    cancel_url: input.cancelUrl ?? appConfig.stripe.cancelUrl,
    payment_method_collection: 'always',
    metadata: {
      contractorId: contractor.id,
      planTier: plan.tier,
    },
    subscription_data: {
      metadata: {
        contractorId: contractor.id,
        planTier: plan.tier,
      },
    },
  });

  await prisma.contractor.update({
    where: { id: contractor.id },
    data: {
      subscriptionTier: plan.tier,
      subscriptionStatus: SubscriptionStatus.PAST_DUE,
      instantPayoutEnabled: plan.instantPayoutIncluded || contractor.instantPayoutEnabled,
      stripeCustomerId: customerId,
    },
  });

  return {
    activation: 'stripe',
    checkoutUrl: session.url,
  };
};

const getFeeBpsForTier = (tier: SubscriptionTier) => {
  const base = appConfig.platformFeeBps;
  if (tier === SubscriptionTier.VERIFIED) {
    return Math.max(base - 75, 25);
  }
  if (tier === SubscriptionTier.PRO) {
    return Math.max(base - 25, 50);
  }
  return base;
};

export const updateSubscriptionFromStripe = async ({
  subscriptionId,
  customerId,
  status,
  planTier,
  currentPeriodEnd,
}: {
  subscriptionId: string;
  customerId: string;
  status: Stripe.Subscription.Status;
  planTier?: SubscriptionTier;
  currentPeriodEnd?: number | null;
}) => {
  const contractor = await prismaClient.contractor.findFirst({
    where: {
      stripeCustomerId: customerId,
    },
  });

  if (!contractor) {
    return;
  }

  const tierToPersist = planTier ?? contractor.subscriptionTier;
  const subscriptionStatus = mapStripeStatus(status);

  await prismaClient.contractor.update({
    where: { id: contractor.id },
    data: {
      subscriptionTier: tierToPersist,
      subscriptionStatus,
      stripeSubscriptionId: subscriptionId,
      subscriptionRenewalAt: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : contractor.subscriptionRenewalAt,
      instantPayoutEnabled:
        tierToPersist !== SubscriptionTier.FREE ? contractor.instantPayoutEnabled || tierToPersist === SubscriptionTier.VERIFIED : contractor.instantPayoutEnabled,
    },
  });
};

const mapStripeStatus = (status: Stripe.Subscription.Status): SubscriptionStatus => {
  switch (status) {
    case 'active':
      return SubscriptionStatus.ACTIVE;
    case 'past_due':
      return SubscriptionStatus.PAST_DUE;
    case 'canceled':
    case 'unpaid':
      return SubscriptionStatus.CANCELED;
    default:
      return SubscriptionStatus.PAST_DUE;
  }
};


