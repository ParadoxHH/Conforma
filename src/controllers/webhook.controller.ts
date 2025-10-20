import { Request, Response } from 'express';
import Stripe from 'stripe';
import { trace, SpanStatusCode } from '@opentelemetry/api';
import { Prisma, SubscriptionTier } from '@prisma/client';
import prisma from '../lib/prisma';
import { appConfig } from '../config/app.config';
import { getStripe, isStripeConfigured } from '../lib/stripe';
import { updateSubscriptionFromStripe } from '../services/billing.service';

const webhookTracer = trace.getTracer('conforma.webhooks');

export const handleEscrowWebhook = async (req: Request, res: Response) => {
  await webhookTracer.startActiveSpan('escrow.webhook', async (span) => {
    const { event, data } = req.body ?? {};
    span.setAttributes({
      'webhook.provider': 'escrow',
      'webhook.event': event ?? 'unknown',
    });

    try {
      await prisma.webhookEvent.create({
        data: {
          source: 'escrow.com',
          payload: req.body,
        },
      });

      if (event === 'transaction.updated') {
        const { id: transactionId, status: transactionStatus } = data ?? {};

        if (!transactionId) {
          span.addEvent('transaction_id_missing');
          span.setStatus({ code: SpanStatusCode.OK });
          res.status(200).send('Webhook received');
          return;
        }

        span.setAttributes({
          'escrow.transaction_id': transactionId,
          'escrow.transaction_status': transactionStatus ?? 'unknown',
        });

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
            span.addEvent('job_status_updated', {
              'job.id': job.id,
              'job.status.new': newJobStatus,
            });
          }
        }
      }

      span.setStatus({ code: SpanStatusCode.OK });
      res.status(200).send('Webhook received');
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      console.error('Error processing Escrow.com webhook:', error);
      res.status(500).send('Error processing webhook');
    } finally {
      span.end();
    }
  });
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = appConfig.stripe.webhookSecret;

  let event: Stripe.Event;

  try {
    if (signature && webhookSecret && isStripeConfigured()) {
      const stripe = getStripe();
      const buffer = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
      event = stripe.webhooks.constructEvent(buffer, signature, webhookSecret);
    } else {
      event = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body as Stripe.Event);
    }
  } catch (error) {
    await prisma.webhookEvent.create({
      data: {
        source: 'stripe:invalid',
        payload: { message: (error as Error).message },
      },
    });
    return res.status(400).json({ message: `Stripe signature verification failed: ${(error as Error).message}` });
  }

  await prisma.webhookEvent.create({
    data: {
      source: 'stripe',
      payload: JSON.parse(JSON.stringify(event)) as Prisma.JsonObject,
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
  if (upper === 'FREE') {
    return SubscriptionTier.FREE;
  }
  if (upper === 'PRO') {
    return SubscriptionTier.PRO;
  }
  if (upper === 'VERIFIED') {
    return SubscriptionTier.VERIFIED;
  }
  return undefined;
};
