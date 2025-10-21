"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";


type AutonomyFlags = {
  autonomyEnabled: boolean;
  emailsEnabled: boolean;
  aiDocVerifyEnabled: boolean;
  riskRulesEnabled: boolean;
  observabilityEnabled: boolean;
  weeklyDigestEnabled: boolean;
};

type CronRun = {
  job: string;
  ranAt: string;
  notes?: string;
};

type AutonomyHealth = {
  flags: AutonomyFlags;
  cron: CronRun[];
  timestamp: string;
};

const fetchAutonomyHealth = async () => {
  return apiClient.get<AutonomyHealth>("/autonomy/health");
};

const flagLabel: Record<keyof AutonomyFlags, string> = {
  autonomyEnabled: "Autonomy mode",
  emailsEnabled: "Transactional emails",
  aiDocVerifyEnabled: "AI document verification",
  riskRulesEnabled: "Risk engine",
  observabilityEnabled: "Observability",
  weeklyDigestEnabled: "Weekly digest",
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "Unknown" : parsed.toLocaleString();
};

export default function AutonomyPage() {
  const healthQuery = useQuery({
    queryKey: ["autonomy-health"],
    queryFn: fetchAutonomyHealth,
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Autonomy health</h1>
          <p className="text-sm text-slate-600">
            Snapshot of feature flags and the most recent automation activity across Conforma.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => healthQuery.refetch()} disabled={healthQuery.isFetching}>
          {healthQuery.isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </header>

      {healthQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading autonomy status...</p>
      ) : healthQuery.isError ? (
        <p className="text-sm text-red-600">
          {(healthQuery.error as Error)?.message ?? "Unable to load autonomy status."}
        </p>
      ) : healthQuery.data ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Feature flags</h2>
              <p className="text-xs text-slate-500">Flags are sourced from environment configuration.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              {Object.entries(healthQuery.data.flags).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 px-3 py-2">
                  <span className="font-medium text-slate-800">{flagLabel[key as keyof AutonomyFlags] ?? key}</span>
                  <span
                    className={value ? "text-emerald-600" : "text-slate-400"}
                  >
                    {value ? "Enabled" : "Disabled"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Last checked {formatDate(healthQuery.data.timestamp)}
            </p>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Cron activity</h2>
              <p className="text-xs text-slate-500">Recent automation jobs and their status notes.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              {healthQuery.data.cron.length === 0 ? (
                <p className="text-xs text-slate-500">No cron executions recorded yet.</p>
              ) : (
                healthQuery.data.cron.map((run) => (
                  <div
                    key={`${run.job}-${run.ranAt}`}
                    className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-800">{run.job}</span>
                      <span className="text-xs text-slate-500">{formatDate(run.ranAt)}</span>
                    </div>
                    {run.notes ? (
                      <p className="mt-2 text-xs text-slate-600">{run.notes}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
