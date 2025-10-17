'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '@/components/auth-context';
import { ChartCard } from '@/components/chart-card';
import { ExportButton } from '@/components/export-button';
import { apiClient } from '@/lib/api-client';

type ContractorAnalytics = {
  jobsWonPercentage: number;
  disputesRate: number;
  averagePayoutDays: number;
  revenueNetOfFees: number;
  instantPayoutUsage: number;
  totals: {
    totalJobs: number;
    completedJobs: number;
    disputedJobs: number;
    payouts: number;
  };
};

type HomeownerAnalytics = {
  totalSpend: number;
  averageCompletionDays: number;
  approvalRate: number;
  disputeRate: number;
  totals: {
    jobs: number;
    milestones: number;
    approvedMilestones: number;
    disputedMilestones: number;
  };
};

const fetchContractorAnalytics = async (): Promise<ContractorAnalytics> =>
  apiClient.get<ContractorAnalytics>('/analytics/contractor');
const fetchHomeownerAnalytics = async (): Promise<HomeownerAnalytics> =>
  apiClient.get<HomeownerAnalytics>('/analytics/homeowner');

const COLORS = ['#0ea5e9', '#a855f7'];
const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const isContractor = user?.role === 'CONTRACTOR';

  const analyticsQuery = useQuery<ContractorAnalytics | HomeownerAnalytics>({
    queryKey: ['analytics', user?.role],
    queryFn: () => (isContractor ? fetchContractorAnalytics() : fetchHomeownerAnalytics()),
    enabled: Boolean(user),
  });

  const charts = useMemo(() => {
    if (!analyticsQuery.data) {
      return null;
    }

    if (isContractor) {
      const contractor = analyticsQuery.data as ContractorAnalytics;
      const jobDistribution = [
        { name: 'Completed', value: contractor.totals.completedJobs },
        { name: 'Disputed', value: contractor.totals.disputedJobs },
        { name: 'Open', value: Math.max(contractor.totals.totalJobs - contractor.totals.completedJobs - contractor.totals.disputedJobs, 0) },
      ];

      return (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard
            title="Jobs Won"
            value={`${Math.round(contractor.jobsWonPercentage * 100)}%`}
            helperText={`${contractor.totals.completedJobs} of ${contractor.totals.totalJobs} jobs`}
            trendLabel="Disputes"
            trendValue={`${Math.round(contractor.disputesRate * 100)}%`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobDistribution}>
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard
            title="Instant Payout Usage"
            value={`${Math.round((contractor.instantPayoutUsage || 0) * 100)}%`}
            helperText={`${contractor.totals.payouts} payouts issued`}
            trendLabel="Avg Payout Time"
            trendValue={`${contractor.averagePayoutDays.toFixed(1)} days`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Instant', value: contractor.instantPayoutUsage || 0 },
                    { name: 'Standard', value: 1 - (contractor.instantPayoutUsage || 0) },
                  ]}
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {[0, 1].map((index) => (
                    <Cell key={index} fill={COLORS[index] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      );
    }

    const homeowner = analyticsQuery.data as HomeownerAnalytics;
    const milestoneDistribution = [
      { name: 'Approved', value: homeowner.totals.approvedMilestones },
      { name: 'Disputed', value: homeowner.totals.disputedMilestones },
    ];

    return (
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard
          title="Total Spend"
          value={currencyFormatter.format(homeowner.totalSpend)}
          helperText={`${homeowner.totals.jobs} jobs funded`}
          trendLabel="Avg Completion"
          trendValue={`${homeowner.averageCompletionDays.toFixed(1)} days`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[{ name: 'Spend', value: homeowner.totalSpend }]}> 
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip formatter={(value: number) => currencyFormatter.format(value)} />
              <Bar dataKey="value" radius={[12, 12, 12, 12]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Milestone Outcomes"
          value={`${Math.round(homeowner.approvalRate * 100)}% approved`}
          helperText={`${homeowner.totals.milestones} milestones`}
          trendLabel="Dispute Rate"
          trendValue={`${Math.round(homeowner.disputeRate * 100)}%`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={milestoneDistribution} dataKey="value" innerRadius={30} outerRadius={60} paddingAngle={4}>
                {milestoneDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index] ?? '#475569'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    );
  }, [analyticsQuery.data, isContractor]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isContractor ? 'Operational performance across your funded jobs.' : 'How your projects have performed on Conforma.'}
          </p>
        </div>
        <ExportButton />
      </div>

      {analyticsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading analytics…</p>
      ) : analyticsQuery.isError ? (
        <p className="text-sm text-rose-500">Unable to load analytics right now.</p>
      ) : (
        charts
      )}
    </div>
  );
}
