import Link from 'next/link';

import { ContractorSummary } from '@/types/contractor';
import { BadgeRow } from '@/components/badge-row';
import { cn } from '@/lib/utils';

const tradeLabels: Record<string, string> = {
  ROOFING: 'Roofing',
  MOVING: 'Moving',
  SOLAR: 'Solar',
  TREE_TRIMMING: 'Tree Trimming',
  HOME_IMPROVEMENT: 'Home Improvement',
  OTHER: 'Other Services',
};

type ContractorCardProps = {
  contractor: ContractorSummary;
  onInvite?: (contractor: ContractorSummary) => void;
  className?: string;
};

export function ContractorCard({ contractor, onInvite, className }: ContractorCardProps) {
  const rating = contractor.ratingCount > 0 ? contractor.ratingAvg.toFixed(1) : '—';
  const subheading = contractor.tagline ?? 'Trusted Texas contractor on Conforma';

  return (
    <article
      className={cn(
        'rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10',
        className,
      )}
    >
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-[220px] flex-1">
          <div className="flex items-center gap-3">
            {contractor.avatarUrl ? (
              <img
                src={contractor.avatarUrl}
                alt={contractor.companyName ?? 'Contractor logo'}
                className="size-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {contractor.companyName?.slice(0, 2).toUpperCase() ?? 'CO'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {contractor.companyName ?? 'Conforma Contractor'}
              </h3>
              <p className="text-sm text-slate-600">{subheading}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {contractor.trades.map((trade) => (
              <span
                key={trade}
                className="rounded-full bg-primary/5 px-3 py-1 font-semibold text-primary"
              >
                {tradeLabels[trade] ?? trade}
              </span>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">Rating:</span>{' '}
            <span>
              {rating}
              {contractor.ratingCount > 0 ? ` (${contractor.ratingCount})` : ' (new)'}
            </span>
            {contractor.distanceMiles !== undefined && contractor.distanceMiles !== null ? (
              <span className="ml-3 inline-flex items-center text-xs text-slate-500">
                {contractor.distanceMiles.toFixed(1)} mi away
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <BadgeRow badges={contractor.badges} className="justify-end" />
          <div className="flex gap-2">
            <Link
              href={`/contractors/${contractor.id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
            >
              View profile
            </Link>
            {onInvite ? (
              <button
                type="button"
                onClick={() => onInvite(contractor)}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90"
              >
                Invite
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
