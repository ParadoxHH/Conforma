import { PrismaClient, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import Stripe from 'stripe';
import prismaClient from '../lib/prisma';
import { appConfig, subscriptionPlans, SubscriptionPlanDefinition } from '../config/app.config';
import { getStripe, isStripeConfigured } from '../lib/stripe';
import { getReferralSummary, redeemReferralCredit } from './referral.service';

type SubscribeInput = {
  plan: 'PRO' | 'VERIFIED';
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

export const listPlans = (): SubscriptionPlanDefinition[] => subscriptionPlans;

export const getBillingSummary = async (
  userId: string,
  prisma: PrismaClient = prismaClient,
): Promise<BillingSummary> => {
  const contractor = await prisma.contractor.findUnique({ where: { userId } });
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
    renewalAt: contractor.subscriptionRenewalAt ?? null,
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
  const contractor = await prisma.contractor.findUnique({ where: { userId }, include: { user: true } });
  if (!contractor) {
    throw new Error('Contractor profile not found.');
  }

  const plan = subscriptionPlans.find((p) => p.tier === input.plan);
  if (!plan) {
    throw new Error(`Unknown plan ${input.plan}`);
  }

  const referralSummary = await getReferralSummary(userId, prisma);
  const hasReferralCredit = referralSummary.stats.credits > 0;

  if (hasReferralCredit) {
    await redeemReferralCredit(userId, prisma);
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
      activation: 'referral-credit' as const,
      checkoutUrl: null,
      creditsRemaining: referralSummary.stats.credits - 1,
    };
  }

  if (!isStripeConfigured() || !plan.priceId) {
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
      activation: 'local' as const,
      checkoutUrl: null,
    };
  }

  const stripe = getStripe();

  let customerId = contractor.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: contractor.user?.email ?? undefined,
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
    activation: 'stripe' as const,
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
  planTier?: SubscriptionTier | null;
  currentPeriodEnd?: number | null;
}) => {
  const contractor = await prismaClient.contractor.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (!contractor) {
    return;
  }

  const nextTier = planTier ?? contractor.subscriptionTier;
  const nextStatus = mapStripeStatus(status);

  await prismaClient.contractor.update({
    where: { id: contractor.id },
    data: {
      subscriptionTier: nextTier,
      subscriptionStatus: nextStatus,
      stripeSubscriptionId: subscriptionId,
      subscriptionRenewalAt: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : contractor.subscriptionRenewalAt,
      instantPayoutEnabled:
        nextTier !== SubscriptionTier.FREE
          ? contractor.instantPayoutEnabled || nextTier === SubscriptionTier.VERIFIED
          : contractor.instantPayoutEnabled,
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
