"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RiskConfig = {
  allowThreshold: number;
  blockThreshold: number;
  maxJobAmountByTrade: Record<string, number>;
  updatedAt: string;
  createdAt: string;
};

type RiskEvent = {
  id: string;
  jobId: string;
  score: number;
  reasons: string[];
  createdAt: string;
};

const fetchRiskConfig = async () => {
  const response = await apiClient.get<{ config: RiskConfig }>("/admin/risk/config");
  return response.config;
};

const fetchRiskEvent = async (jobId: string) => {
  const response = await apiClient.get<{ event: RiskEvent }>(`/admin/risk/${jobId}`);
  return response.event;
};

export default function AdminRiskPage() {
  const { data: config, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-risk-config"],
    queryFn: fetchRiskConfig,
  });

  const [allowThreshold, setAllowThreshold] = useState<string>("");
  const [blockThreshold, setBlockThreshold] = useState<string>("");
  const [tradeRows, setTradeRows] = useState<Array<{ key: string; value: string }>>([]);

  useEffect(() => {
    if (!config) {
      return;
    }
    setAllowThreshold(String(config.allowThreshold));
    setBlockThreshold(String(config.blockThreshold));
    const rows = Object.entries(config.maxJobAmountByTrade ?? {}).map(([key, value]) => ({
      key,
      value: String(value),
    }));
    setTradeRows(rows);
  }, [config]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};

      const allow = Number(allowThreshold);
      if (!Number.isNaN(allow) && allowThreshold !== "") {
        payload.allowThreshold = allow;
      }

      const block = Number(blockThreshold);
      if (!Number.isNaN(block) && blockThreshold !== "") {
        payload.blockThreshold = block;
      }

      const caps: Record<string, number> = {};
      tradeRows.forEach((row) => {
        const normalizedKey = row.key.trim().toUpperCase();
        const amount = Number(row.value);
        if (normalizedKey && !Number.isNaN(amount)) {
          caps[normalizedKey] = amount;
        }
      });

      if (Object.keys(caps).length > 0) {
        payload.maxJobAmountByTrade = caps;
      }

      const response = await apiClient.put<{ config: RiskConfig }>("/admin/risk/config", payload);
      return response.config;
    },
    onSuccess: (updated) => {
      setAllowThreshold(String(updated.allowThreshold));
      setBlockThreshold(String(updated.blockThreshold));
      const rows = Object.entries(updated.maxJobAmountByTrade ?? {}).map(([key, value]) => ({
        key,
        value: String(value),
      }));
      setTradeRows(rows);
      void refetch();
    },
  });

  const [lookupJobId, setLookupJobId] = useState("");
  const [lastLookup, setLastLookup] = useState<string | null>(null);

  const lookupMutation = useMutation({
    mutationFn: (jobId: string) => fetchRiskEvent(jobId),
    onSuccess: (_event, jobId) => {
      setLastLookup(jobId);
    },
    onError: () => {
      setLastLookup(lookupJobId);
    },
  });

  const handleAddTradeRow = () => {
    setTradeRows((rows) => [...rows, { key: "", value: "" }]);
  };

  const handleTradeChange = (index: number, field: "key" | "value", next: string) => {
    setTradeRows((rows) =>
      rows.map((row, idx) => (idx === index ? { ...row, [field]: next } : row)),
    );
  };

  const handleRemoveRow = (index: number) => {
    setTradeRows((rows) => rows.filter((_, idx) => idx !== index));
  };

  const handleLookup = () => {
    if (!lookupJobId) {
      return;
    }
    lookupMutation.mutate(lookupJobId);
  };

  const renderStatusMessage = () => {
    if (updateMutation.isSuccess) {
      return <p className="text-sm text-emerald-600">Risk configuration updated.</p>;
    }
    if (updateMutation.isError) {
      return (
        <p className="text-sm text-red-600">
          {(updateMutation.error as Error)?.message ?? "Failed to update risk configuration."}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Risk Controls</h1>
        <p className="text-sm text-slate-600">
          Tune automated flags and review the latest risk signals before releasing project funds.
        </p>
      </header>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading configuration...</p>
      ) : isError ? (
        <p className="text-sm text-red-600">{(error as Error)?.message ?? "Unable to load risk configuration."}</p>
      ) : config ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Thresholds</h2>
              <p className="text-xs text-slate-500">
                Scores below the allow threshold are approved automatically. Scores at or above the block threshold are rejected.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="allow-threshold">Allow threshold</Label>
                <Input
                  id="allow-threshold"
                  type="number"
                  min={0}
                  max={100}
                  value={allowThreshold}
                  onChange={(event) => setAllowThreshold(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-threshold">Block threshold</Label>
                <Input
                  id="block-threshold"
                  type="number"
                  min={0}
                  max={100}
                  value={blockThreshold}
                  onChange={(event) => setBlockThreshold(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Trade caps</h3>
                  <p className="text-xs text-slate-500">Maximum job amount before additional scrutiny.</p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleAddTradeRow}>
                  Add trade
                </Button>
              </div>
              <div className="space-y-2">
                {tradeRows.length === 0 ? (
                  <p className="text-xs text-slate-500">No trade caps defined.</p>
                ) : (
                  tradeRows.map((row, index) => (
                    <div key={`${row.key}-${index}`} className="grid gap-3 sm:grid-cols-[1fr,1fr,auto]">
                      <div className="space-y-2">
                        <Label htmlFor={`trade-${index}`}>Trade</Label>
                        <Input
                          id={`trade-${index}`}
                          placeholder="ROOFING"
                          value={row.key}
                          onChange={(event) => handleTradeChange(index, "key", event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`cap-${index}`}>Max amount</Label>
                        <Input
                          id={`cap-${index}`}
                          type="number"
                          min={0}
                          placeholder="30000"
                          value={row.value}
                          onChange={(event) => handleTradeChange(index, "value", event.target.value)}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" variant="ghost" onClick={() => handleRemoveRow(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <p>Last updated {new Date(config.updatedAt).toLocaleString()}</p>
                {renderStatusMessage()}
              </div>
              <Button type="button" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </section>

          <section className="space-y-4 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm shadow-slate-900/5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Recent configuration</h2>
              <p className="text-xs text-slate-500">Snapshot of the current automated guardrails.</p>
            </div>
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                Allow threshold <span className="font-semibold">{config.allowThreshold}</span> • Block threshold{" "}
                <span className="font-semibold">{config.blockThreshold}</span>
              </p>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">Trade caps</p>
                {Object.keys(config.maxJobAmountByTrade ?? {}).length === 0 ? (
                  <p className="text-xs text-slate-500">None configured.</p>
                ) : (
                  <ul className="space-y-1 text-xs text-slate-600">
                    {Object.entries(config.maxJobAmountByTrade)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([trade, amount]) => (
                        <li key={trade}>
                          <span className="font-medium text-slate-700">{trade}</span> •{" "}
                          {amount.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4">
              <h3 className="text-sm font-semibold text-slate-800">Check a job</h3>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="risk-job-lookup">Job ID</Label>
                  <Input
                    id="risk-job-lookup"
                    placeholder="job_123"
                    value={lookupJobId}
                    onChange={(event) => setLookupJobId(event.target.value)}
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleLookup} disabled={lookupMutation.isPending}>
                  {lookupMutation.isPending ? "Checking..." : "Lookup"}
                </Button>
              </div>
              {lastLookup ? (
                lookupMutation.isError ? (
                  <p className="text-xs text-red-600">No risk event found for job {lastLookup}.</p>
                ) : lookupMutation.data ? (
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      Job <span className="font-semibold text-slate-800">{lastLookup}</span> scored{' '}
                      <span className="font-semibold text-slate-800">{lookupMutation.data.score}</span> on{' '}
                      {new Date(lookupMutation.data.createdAt).toLocaleString()}
                    </p>
                    <p>Reasons:</p>
                    <ul className="ml-4 list-disc space-y-1 text-slate-500">
                      {lookupMutation.data.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                ) : null
              ) : null}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

