'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { MatchingList } from '@/components/matching-list';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

const fetchMatches = async (params: { zip?: string; trade?: string; budget?: number | null }) => {
  return apiClient.get('/match/contractors', {
    query: {
      zip: params.zip,
      trade: params.trade,
      budget: params.budget ?? undefined,
    },
  });
};

export default function CreateProjectPage() {
  const [zip, setZip] = useState('78701');
  const [trade, setTrade] = useState('Roofing');
  const [budget, setBudget] = useState('10000');

  const matchesQuery = useQuery({
    queryKey: ['matching-contractors', zip, trade, budget],
    queryFn: () =>
      fetchMatches({
        zip,
        trade,
        budget: Number.isNaN(Number(budget)) ? undefined : Number(budget),
      }),
  });

  const mutation = useMutation({
    mutationFn: () =>
      fetchMatches({
        zip,
        trade,
        budget: Number.isNaN(Number(budget)) ? undefined : Number(budget),
      }),
    onSuccess: () => {
      matchesQuery.refetch();
    },
  });

  const matches = matchesQuery.data ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Create a new project</h1>
        <p className="mt-2 text-sm text-slate-600">Tell us about the scope and we’ll pre-match vetted contractors.</p>

        <form
          className="mt-6 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div>
            <label className="text-xs uppercase text-slate-500">Zip code</label>
            <input
              value={zip}
              onChange={(event) => setZip(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-400"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Trade</label>
            <input
              value={trade}
              onChange={(event) => setTrade(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-400"
            />
          </div>
          <div>
            <label className="text-xs uppercase text-slate-500">Budget (USD)</label>
            <input
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm focus:border-slate-400"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Finding matches…' : 'Refresh matches'}
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Recommended Contractors</h2>
        {matchesQuery.isLoading ? (
          <p className="text-sm text-slate-500">Calculating matches…</p>
        ) : matchesQuery.isError ? (
          <p className="text-sm text-rose-500">Unable to load matches.</p>
        ) : (
          <MatchingList matches={matches} />
        )}
      </div>
    </div>
  );
}

