'use client';

type AiSummaryCardProps = {
  summary: string;
  suggestion: 'PARTIAL_RELEASE' | 'PARTIAL_REFUND' | 'RESUBMIT' | 'UNSURE';
  confidence?: number | null;
  modelInfo?: Record<string, unknown> | null;
};

const suggestionCopy: Record<AiSummaryCardProps['suggestion'], { label: string; color: string }> = {
  PARTIAL_RELEASE: { label: 'Suggest: Partial Release', color: 'bg-emerald-50 text-emerald-700' },
  PARTIAL_REFUND: { label: 'Suggest: Partial Refund', color: 'bg-amber-50 text-amber-700' },
  RESUBMIT: { label: 'Suggest: Resubmit Evidence', color: 'bg-blue-50 text-blue-700' },
  UNSURE: { label: 'AI Suggestion: Needs Review', color: 'bg-slate-100 text-slate-600' },
};

export function AiSummaryCard({ summary, suggestion, confidence, modelInfo }: AiSummaryCardProps) {
  const display = suggestionCopy[suggestion];
  const formattedConfidence =
    typeof confidence === 'number' ? `${Math.round(confidence * 100)}% confidence` : null;
  const provider = typeof modelInfo?.provider === 'string' ? String(modelInfo.provider) : 'AI assistant';

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${display.color}`}>
          {display.label}
        </span>
        <span className="text-xs uppercase text-slate-400">{provider}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-700">{summary}</p>
      <div className="mt-4 text-xs text-slate-500">
        {formattedConfidence ?? 'Confidence unavailable'}
      </div>
    </div>
  );
}
