'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { AiSummaryCard } from '@/components/ai-summary-card';
import { Button } from '@/components/ui/button';

type Dispute = {
  id: string;
  reasonText: string;
  status: string;
  milestone: {
    title: string;
    job: {
      title: string;
      homeowner: { user: { email: string } };
      contractor: { user: { email: string } };
    };
  };
};

type AiSummary = {
  summary: string;
  suggestion: 'PARTIAL_RELEASE' | 'PARTIAL_REFUND' | 'RESUBMIT' | 'UNSURE';
  confidence?: number | null;
  modelInfo?: Record<string, unknown> | null;
};

const fetchDispute = async (id: string): Promise<Dispute> => apiClient.get(`/disputes/${id}`);
const fetchAiSummary = async (id: string): Promise<AiSummary> => apiClient.get(`/ai/disputes/${id}`);
const runAiTriage = async (id: string): Promise<AiSummary> => apiClient.post(`/ai/disputes/${id}/triage`);

export default function AdminDisputeDetail() {
  const params = useParams();
  const disputeId = params?.id as string;
  const queryClient = useQueryClient();

  const disputeQuery = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: () => fetchDispute(disputeId),
    enabled: Boolean(disputeId),
  });

  const summaryQuery = useQuery({
    queryKey: ['ai-dispute', disputeId],
    queryFn: () => fetchAiSummary(disputeId),
    enabled: Boolean(disputeId),
  });

  const triageMutation = useMutation({
    mutationFn: () => runAiTriage(disputeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-dispute', disputeId] }),
  });

  return (
    <div className="space-y-8">
      {disputeQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading dispute details…</p>
      ) : disputeQuery.isError || !disputeQuery.data ? (
        <p className="text-sm text-rose-500">Unable to load dispute.</p>
      ) : (
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold text-slate-900">Admin Dispute Review</h1>
          <p className="text-sm text-slate-600">{disputeQuery.data.reasonText}</p>
          <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
            <p>
              <span className="font-semibold text-slate-700">Job:</span> {disputeQuery.data.milestone.job.title}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Milestone:</span> {disputeQuery.data.milestone.title}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Homeowner:</span> {disputeQuery.data.milestone.job.homeowner.user.email}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Contractor:</span> {disputeQuery.data.milestone.job.contractor.user.email}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={() => triageMutation.mutate()} disabled={triageMutation.isPending}>
          {triageMutation.isPending ? 'Generating summary…' : 'Run AI triage'}
        </Button>
      </div>

      {summaryQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading AI summary…</p>
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <p className="text-sm text-slate-500">No AI summary yet.</p>
      ) : (
        <AiSummaryCard
          summary={summaryQuery.data.summary}
          suggestion={summaryQuery.data.suggestion}
          confidence={summaryQuery.data.confidence ?? null}
          modelInfo={summaryQuery.data.modelInfo ?? null}
        />
      )}
    </div>
  );
}
