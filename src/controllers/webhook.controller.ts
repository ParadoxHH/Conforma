import { Request, Response } from 'express';
import Stripe from 'stripe';
import { SubscriptionTier } from '@prisma/client';
import prisma from '../lib/prisma';
import { appConfig } from '../config/app.config';
import { getStripe, isStripeConfigured } from '../lib/stripe';
import { updateSubscriptionFromStripe } from '../services/billing.service';

export const handleEscrowWebhook = async (req: Request, res: Response) => {
  const { event, data } = req.body;

  await prisma.webhookEvent.create({
    data: {
      source: 'escrow.com',
      payload: req.body,
    },
  });

  try {
    if (event === 'transaction.updated') {
      const { id: transactionId, status: transactionStatus } = data;

      const job = await prisma.job.findFirst({
        where: { escrowTransactionId: transactionId },
      });

      if (job) {
        let newJobStatus = job.status;
        if (transactionStatus === 'funded') {
          newJobStatus = 'IN_PROGRESS';
        } else if (transactionStatus === 'cancelled') {
          newJobStatus = 'DISPUTED';
        }

        if (newJobStatus !== job.status) {
          await prisma.job.update({
            where: { id: job.id },
            data: { status: newJobStatus },
          });
          console.log(Updated job  to status );
        }
      }
    }

    res.status(200).send('Webhook received');
  } catch (error) {
    console.error('Error processing Escrow.com webhook:', error);
    res.status(500).send('Error processing webhook');
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = appConfig.stripe.webhookSecret;

  let event: Stripe.Event;

  try {
    if (signature && webhookSecret && isStripeConfigured()) {
      const stripe = getStripe();
      const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } else {
      const raw = req.body instanceof Buffer ? req.body.toString('utf-8') : JSON.stringify(req.body ?? {});
      event = JSON.parse(raw);
    }
  } catch (error) {
    await prisma.webhookEvent.create({
      data: {
        source: 'stripe:invalid',
        payload: { message: (error as Error).message },
      },
    });
    return res.status(400).json({ message: Stripe signature verification failed:  });
  }

  await prisma.webhookEvent.create({
    data: {
      source: 'stripe',
      payload: event,
    },
  });

  if (!isStripeConfigured()) {
    return res.status(200).json({ received: true, note: 'Stripe not configured; event stored for auditing only.' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionLifecycle(event);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Error handling Stripe webhook', error);
    return res.status(500).json({ message: 'Error handling Stripe webhook' });
  }

  return res.json({ received: true });
};

const handleCheckoutSessionCompleted = async (event: Stripe.Event) => {
  const session = event.data.object as Stripe.Checkout.Session;
  if (!session.subscription || !session.customer) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const tier =
    parseTier(session.metadata?.planTier) ??
    parseTier(subscription.metadata?.planTier) ??
    parseTier(subscription.items.data[0]?.price?.metadata?.planTier);

  await updateSubscriptionFromStripe({
    subscriptionId: subscription.id,
    customerId: String(subscription.customer),
    status: subscription.status,
    planTier: tier,
    currentPeriodEnd: subscription.current_period_end,
  });
};

const handleSubscriptionLifecycle = async (event: Stripe.Event) => {
  const subscription = event.data.object as Stripe.Subscription;

  await updateSubscriptionFromStripe({
    subscriptionId: subscription.id,
    customerId: String(subscription.customer),
    status: subscription.status,
    planTier:
      parseTier(subscription.metadata?.planTier) ??
      parseTier(subscription.items.data[0]?.price?.metadata?.planTier),
    currentPeriodEnd: subscription.current_period_end,
  });
};

const handleInvoiceEvent = async (event: Stripe.Event) => {
  const invoice = event.data.object as Stripe.Invoice;
  if (!invoice.subscription || !invoice.customer) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const planTier =
    parseTier(subscription.metadata?.planTier) ??
    parseTier(subscription.items.data[0]?.price?.metadata?.planTier);
  const status = event.type === 'invoice.payment_succeeded' ? 'active' : 'past_due';

  await updateSubscriptionFromStripe({
    subscriptionId: subscription.id,
    customerId: String(invoice.customer),
    status: status as Stripe.Subscription.Status,
    planTier,
    currentPeriodEnd: subscription.current_period_end,
  });
};

const parseTier = (value?: string | null): SubscriptionTier | undefined => {
  if (!value) {
    return undefined;
  }

  const upper = value.toUpperCase();
  if (upper === SubscriptionTier.FREE) {
    return SubscriptionTier.FREE;
  }
  if (upper === SubscriptionTier.PRO) {
    return SubscriptionTier.PRO;
  }
  if (upper === SubscriptionTier.VERIFIED) {
    return SubscriptionTier.VERIFIED;
  }
  return undefined;
};
