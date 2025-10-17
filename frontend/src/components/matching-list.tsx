'use client';

type MatchingContractor = {
  contractorId: string;
  score: number;
  reasons: string[];
  distanceMiles?: number | null;
  contractor: {
    companyName: string | null;
    ratingAvg: number;
    ratingCount: number;
    subscriptionTier: 'FREE' | 'PRO' | 'VERIFIED';
    verified: boolean;
    serviceAreas: string[];
    instantPayoutEnabled: boolean;
    trades: string[];
  };
};

type MatchingListProps = {
  matches: MatchingContractor[];
};

export function MatchingList({ matches }: MatchingListProps) {
  if (!matches.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No contractors found yet. Adjust your filters to see recommendations.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div key={match.contractorId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-semibold text-slate-900">
                {match.contractor.companyName ?? 'Contractor'}
              </h4>
              <div className="mt-1 text-xs uppercase text-slate-400">
                {match.contractor.subscriptionTier} - Rating {match.contractor.ratingAvg.toFixed(1)} (
                {match.contractor.ratingCount})
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Score: {Math.round(match.score)}</p>
              {typeof match.distanceMiles === 'number' ? (
                <p>{Math.round(match.distanceMiles)} mi away</p>
              ) : null}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {match.reasons.map((reason) => (
              <span key={reason} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                {reason}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
