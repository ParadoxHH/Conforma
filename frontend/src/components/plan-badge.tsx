'use client';

import { cn } from '@/lib/utils';

type PlanBadgeProps = {
  tier: 'FREE' | 'PRO' | 'VERIFIED';
  className?: string;
};

const colors: Record<PlanBadgeProps['tier'], string> = {
  FREE: 'bg-slate-200 text-slate-700',
  PRO: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-emerald-100 text-emerald-700',
};

export function PlanBadge({ tier, className }: PlanBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide',
        colors[tier],
        className,
      )}
    >
      {tier.toLowerCase()}
    </span>
  );
}
