'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Check, Loader2, X } from 'lucide-react';
import { PricingPlan } from './pricing-table';
import { Button } from './ui/button';

type UpgradeDialogProps = {
  open: boolean;
  plan: PricingPlan | null;
  isLoading?: boolean;
  checkoutUrl?: string | null;
  onConfirm: (plan: PricingPlan) => void;
  onClose: () => void;
};

export function UpgradeDialog({ open, plan, isLoading, checkoutUrl, onConfirm, onClose }: UpgradeDialogProps) {
  if (!plan) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <Dialog.Title className="text-xl font-semibold text-slate-900">
                  Upgrade to {plan.name}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-slate-600">
                  {plan.description}
                </Dialog.Description>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-3xl font-semibold text-slate-900">
              {plan.priceMonthly === 0 ? 'Free' : $}
              {plan.priceMonthly > 0 && <span className="ml-1 text-base font-normal text-slate-500">/month</span>}
            </p>

            <div className="mt-4 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              {checkoutUrl ? (
                <Button asChild disabled={isLoading}>
                  <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    Continue to Stripe
                  </a>
                </Button>
              ) : (
                <Button onClick={() => onConfirm(plan)} disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : Activate }
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
