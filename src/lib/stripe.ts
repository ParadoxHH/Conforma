import Stripe from 'stripe';
import { appConfig } from '../config/app.config';

let stripeClient: Stripe | null = null;

const createStripeClient = () => {
  if (!appConfig.stripe.secretKey) {
    return null;
  }

  return new Stripe(appConfig.stripe.secretKey, {
    apiVersion: '2024-06-20',
  });
};

export const getStripe = () => {
  if (!stripeClient) {
    stripeClient = createStripeClient();
  }

  if (!stripeClient) {
    throw new Error('Stripe is not configured. Set STRIPE_SECRET to enable billing features.');
  }

  return stripeClient;
};

export const isStripeConfigured = () => {
  if (!stripeClient) {
    stripeClient = createStripeClient();
  }

  return stripeClient !== null;
};
