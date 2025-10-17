'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ReferralCard, ReferralSummary } from '@/components/referral-card';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

const fetchReferralSummary = async (): Promise<ReferralSummary> => apiClient.get('/referrals/me');
const redeemReferral = async (code: string) => apiClient.post('/referrals/redeem', { code });

export default function ReferralsPage() {
  const [code, setCode] = useState('');
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({ queryKey: ['referral-summary'], queryFn: fetchReferralSummary });

  const mutation = useMutation({
    mutationFn: redeemReferral,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-summary'] });
      setCode('');
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Referral Program</h1>
        <p className="mt-2 text-sm text-slate-600">Share Conforma with your network and earn credits toward PRO tiers or reduced platform fees.</p>
      </div>

      {summaryQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading referral info…</p>
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <p className="text-sm text-rose-500">Unable to load referral dashboard.</p>
      ) : (
        <ReferralCard summary={summaryQuery.data} />
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Redeem a referral code</h2>
        <p className="mt-1 text-sm text-slate-600">Applying a code may unlock discounted fees after your first funded job.</p>

        <form
          className="mt-4 flex flex-wrap items-center gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (code.trim()) {
              mutation.mutate(code.trim());
            }
          }}
        >
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter referral code"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-400"
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Applying…' : 'Apply code'}
          </Button>
        </form>
        {mutation.isError ? (
          <p className="mt-2 text-sm text-rose-500">{(mutation.error as Error).message}</p>
        ) : null}
      </div>
    </div>
  );
}

