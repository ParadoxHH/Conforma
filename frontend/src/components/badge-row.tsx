import { cn } from '@/lib/utils';

type BadgeRowProps = {
  badges: {
    kyc: boolean;
    license: boolean;
    insurance: boolean;
  };
  className?: string;
};

const badgeConfig = [
  {
    key: 'kyc' as const,
    label: 'KYC Verified',
    description: 'Escrow.com identity verification complete',
  },
  {
    key: 'license' as const,
    label: 'License on File',
    description: 'Trade license reviewed by Conforma operations',
  },
  {
    key: 'insurance' as const,
    label: 'Insurance Verified',
    description: 'Active general liability policy verified',
  },
];

export function BadgeRow({ badges, className }: BadgeRowProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {badgeConfig.map((badge) => {
        const active = badges[badge.key];
        return (
          <span
            key={badge.key}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              active
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-slate-200 bg-white/70 text-slate-400',
            )}
            title={badge.description}
          >
            <span
              className={cn(
                'inline-block size-2 rounded-full',
                active ? 'bg-primary' : 'bg-slate-300',
              )}
            />
            {badge.label}
          </span>
        );
      })}
    </div>
  );
}
