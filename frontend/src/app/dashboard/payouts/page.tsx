'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PayoutRow } from '@/components/payout-row';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

type Payout = {
  id: string;
  jobId: string;
  amount: number;
  type: 'STANDARD' | 'INSTANT';
  status: 'PENDING' | 'SENT' | 'SETTLED' | 'FAILED';
  processorRef?: string | null;
  createdAt: string;
  updatedAt?: string;
};

const fetchPayouts = async (status?: string): Promise<Payout[]> => {
  return apiClient.get<Payout[]>('/payouts/me', {
    query: status && status !== 'ALL' ? { status } : undefined,
  });
};

const triggerInstantPayout = async (jobId: string) => {
  return apiClient.post(/payouts//instant);
};

const statuses = ['ALL', 'PENDING', 'SENT', 'SETTLED', 'FAILED'] as const;

export default function PayoutsDashboard() {
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>('ALL');
  const queryClient = useQueryClient();

  const payoutsQuery = useQuery({
    queryKey: ['payouts', statusFilter],
    queryFn: () => fetchPayouts(statusFilter),
  });

  const mutation = useMutation({
    mutationFn: triggerInstantPayout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Payouts</h1>
        <p className="mt-2 text-sm text-slate-600">
          Track Conforma disbursements and trigger instant payouts once jobs are approved.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={ounded-full px-4 py-1 text-xs font-semibold uppercase transition }
            >
              {status.toLowerCase()}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        {payoutsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading payouts…</p>
        ) : payoutsQuery.isError ? (
          <p className="text-sm text-rose-500">Unable to load payout history.</p>
        ) : payoutsQuery.data && payoutsQuery.data.length > 0 ? (
          payoutsQuery.data.map((payout) => <PayoutRow key={payout.id} payout={payout} />)
        ) : (
          <p className="text-sm text-slate-500">No payouts recorded in this filter.</p>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Need funds sooner?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Instant payout is available for completed jobs if your subscription tier includes it. Enter a job ID to request it manually.
        </p>
        <InstantPayoutRequest onSubmit={(jobId) => mutation.mutate(jobId)} loading={mutation.isPending} />
        {mutation.isError ? <p className="mt-2 text-sm text-rose-500">{(mutation.error as Error).message}</p> : null}
      </section>
    </div>
  );
}

type InstantPayoutRequestProps = {
  onSubmit: (jobId: string) => void;
  loading: boolean;
};

function InstantPayoutRequest({ onSubmit, loading }: InstantPayoutRequestProps) {
  const [jobId, setJobId] = useState('');

  return (
    <form
      className="mt-4 flex w-full flex-wrap items-center gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (jobId.trim()) {
          onSubmit(jobId.trim());
          setJobId('');
        }
      }}
    >
      <input
        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400"
        placeholder="Enter job ID"
        value={jobId}
        onChange={(event) => setJobId(event.target.value)}
      />
      <Button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Trigger Instant Payout'}
      </Button>
    </form>
  );
}
