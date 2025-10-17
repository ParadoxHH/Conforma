'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PricingPlan, PricingTable } from '@/components/pricing-table';
import { UpgradeDialog } from '@/components/upgrade-dialog';
import { apiClient } from '@/lib/api-client';

type BillingSummary = {
  tier: 'FREE' | 'PRO' | 'VERIFIED';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED';
  renewalAt: string | null;
  instantPayoutEnabled: boolean;
  instantPayoutEligible: boolean;
  platformFeeBps: number;
  instantPayoutFeeBps: number;
  stripeCustomerPortalUrl?: string;
  stripeSubscriptionId?: string | null;
};

const fetchPlans = async (): Promise<PricingPlan[]> => apiClient.get('/billing/plans');
const fetchBillingSummary = async (): Promise<BillingSummary> => apiClient.get('/billing/me');

export default function BillingDashboard() {
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);

  const {
    data: plans,
    isLoading: plansLoading,
    isError: plansError,
  } = useQuery({ queryKey: ['billing-plans'], queryFn: fetchPlans });

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryError,
  } = useQuery({ queryKey: ['billing-summary'], queryFn: fetchBillingSummary });

  const mutation = useMutation({
    mutationFn: async (plan: PricingPlan) => {
      const response = await apiClient.post<{
        activation: 'stripe' | 'local' | 'referral-credit';
        checkoutUrl: string | null;
        creditsRemaining?: number;
      }>('/billing/subscribe', { plan: plan.tier });
      return response;
    },
    onSuccess: (result) => {
      if (result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
      } else {
        setDialogOpen(false);
        setSelectedPlan(null);
        queryClient.invalidateQueries({ queryKey: ['billing-summary'] });
      }
    },
  });

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setCheckoutUrl(null);
    setDialogOpen(true);
  };

  const currentPlanName = useMemo(() => {
    if (!summary || !plans) {
      return null;
    }
    return plans.find((plan) => plan.tier === summary.tier)?.name ?? summary.tier;
  }, [summary, plans]);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Billing & Subscription</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage your Conforma plan, instant payout eligibility, and Stripe billing portal access.
        </p>

        <div className="mt-6 grid gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-6 md:grid-cols-3">
          {summaryLoading ? (
            <p className="text-sm text-slate-500">Loading subscription status...</p>
          ) : summaryError || !summary ? (
            <p className="text-sm text-rose-500">Unable to load billing summary.</p>
          ) : (
            <>
              <div>
                <p className="text-xs uppercase text-slate-500">Current Plan</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">{currentPlanName}</p>
                <span className="mt-2 inline-block rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase text-white">
                  {summary.status.toLowerCase()}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Renewal Date</p>
                <p className="mt-2 text-sm text-slate-700">
                  {summary.renewalAt ? new Date(summary.renewalAt).toLocaleDateString() : 'Not scheduled'}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Platform fee: {(summary.platformFeeBps / 100).toFixed(2)}% - Instant payout fee:{' '}
                  {(summary.instantPayoutFeeBps / 100).toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Instant Payout</p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {summary.instantPayoutEnabled ? 'Enabled' : summary.instantPayoutEligible ? 'Eligible' : 'Not available'}
                </p>
                {summary.stripeCustomerPortalUrl ? (
                  <a
                    className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
                    href={summary.stripeCustomerPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Manage payment method
                  </a>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Compare plans</h2>
        <p className="mt-1 text-sm text-slate-500">
          Switch plans anytime. Referral credits will auto-apply when available.
        </p>
        <div className="mt-6">
          {plansLoading ? (
            <p className="text-sm text-slate-500">Loading pricing...</p>
          ) : plansError || !plans ? (
            <p className="text-sm text-rose-500">Unable to load plan catalog.</p>
          ) : (
            <PricingTable plans={plans} currentTier={summary?.tier} onSelectPlan={handlePlanSelect} />
          )}
        </div>
      </section>

      <UpgradeDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        plan={selectedPlan}
        onConfirm={(plan) => mutation.mutate(plan)}
        isLoading={mutation.isPending}
        checkoutUrl={checkoutUrl}
      />
    </div>
  );
}
