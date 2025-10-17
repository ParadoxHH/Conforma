'use client';

import { Check } from 'lucide-react';
import { PlanBadge } from './plan-badge';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export type PricingPlan = {
  tier: 'FREE' | 'PRO' | 'VERIFIED';
  name: string;
  priceMonthly: number;
  badge?: string | null;
  description: string;
  features: string[];
  perks: string[];
  instantPayoutIncluded: boolean;
  highlight?: boolean;
};

type PricingTableProps = {
  plans: PricingPlan[];
  currentTier?: PricingPlan['tier'];
  onSelectPlan?: (plan: PricingPlan) => void;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export function PricingTable({ plans, currentTier, onSelectPlan }: PricingTableProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => {
        const isCurrent = plan.tier === currentTier;
        return (
          <div
            key={plan.tier}
            className={cn(
              'flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg',
              plan.highlight && 'border-blue-400 shadow-lg shadow-blue-100',
            )}
          >
            <div className="flex items-center justify-between">
              <div>
                <PlanBadge tier={plan.tier} />
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{plan.name}</h3>
              </div>
              {plan.badge ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase text-blue-600">
                  {plan.badge}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-sm text-slate-600">{plan.description}</p>
            <p className="mt-6 text-4xl font-semibold text-slate-900">
              {plan.priceMonthly === 0 ? 'Free' : currencyFormatter.format(plan.priceMonthly)}
              {plan.priceMonthly > 0 && <span className="ml-1 text-base font-normal text-slate-500">/month</span>}
            </p>
            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-slate-700">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Perks</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {plan.perks.map((perk) => (
                  <li key={perk}>{perk}</li>
                ))}
              </ul>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <div className="text-xs uppercase text-slate-500">
                {plan.instantPayoutIncluded ? 'Instant payout included' : 'Instant payout add-on available'}
              </div>
              {onSelectPlan ? (
                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent}
                  onClick={() => onSelectPlan(plan)}
                >
                  {isCurrent ? 'Current Plan' : 'Switch to ' + plan.name}
                </Button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

