'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PricingTable, PricingPlan } from '@/components/pricing-table';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

const fetchPlans = async (): Promise<PricingPlan[]> => {
  return apiClient.get<PricingPlan[]>('/billing/plans', { skipAuth: true });
};

export default function PricingPage() {
  const { data: plans, isLoading, isError } = useQuery({ queryKey: ['billing-plans'], queryFn: fetchPlans });

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold text-slate-900">Pricing built for growing contractors</h1>
        <p className="mt-4 text-slate-600">
          Conforma’s tiers keep escrow in motion—from core payouts to instant transfer unlocks.
        </p>
      </div>

      <div className="mt-12">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading plans…</p>
        ) : isError || !plans ? (
          <p className="text-center text-sm text-rose-500">Unable to load plans right now.</p>
        ) : (
          <PricingTable plans={plans} />
        )}
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild>
          <Link href="/auth/register">Get Started</Link>
        </Button>
      </div>
    </div>
  );
}

