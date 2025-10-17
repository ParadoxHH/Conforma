'use client';

import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartCard } from '@/components/chart-card';
import { ExportButton } from '@/components/export-button';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/components/auth-context';

type AdminAnalytics = {
  mrr: number;
  churnRate: number;
  arpu: number;
  feeRevenue: number;
  instantPayoutRevenue: number;
  disputeSlaHours: number;
  totals: {
    activeContractors: number;
    churnedContractors: number;
    jobs: number;
    disputes: number;
  };
};

const fetchAdminAnalytics = async (): Promise<AdminAnalytics> => apiClient.get('/analytics/admin');

export default function AdminAnalyticsPage() {
  const { user } = useAuth();
  const analyticsQuery = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: fetchAdminAnalytics,
    enabled: user?.role === 'ADMIN',
  });

  const data = analyticsQuery.data;

  const timeline = data
    ? [
        { label: 'MRR', value: data.mrr },
        { label: 'Fee Revenue', value: data.feeRevenue },
        { label: 'Instant Payout', value: data.instantPayoutRevenue },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Platform Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">High-level metrics across Conforma subscriptions and disputes.</p>
        </div>
        <ExportButton />
      </div>

      {analyticsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading admin analytics…</p>
      ) : analyticsQuery.isError || !data ? (
        <p className="text-sm text-rose-500">Unable to load admin dashboard.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="Monthly Recurring Revenue"
            value={$}
            helperText={${data.totals.activeContractors} active contractors}
            trendLabel="Churn"
            trendValue={${Math.round(data.churnRate * 100)}%}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline}>
                <defs>
                  <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => $} />
                <Area type="monotone" dataKey="value" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMrr)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Fee Performance"
            value={$}
            helperText={Instant payout fees {Math.round(data.instantPayoutRevenue).toLocaleString()}}
            trendLabel="Avg Dispute SLA"
            trendValue={${data.disputeSlaHours.toFixed(1)} hrs}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { label: 'Fees', value: data.feeRevenue },
                { label: 'Instant', value: data.instantPayoutRevenue },
              ]}>
                <defs>
                  <linearGradient id="colorFees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" hide />
                <YAxis hide />
                <Tooltip formatter={(value: number) => $} />
                <Area type="monotone" dataKey="value" stroke="#a855f7" fillOpacity={1} fill="url(#colorFees)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
