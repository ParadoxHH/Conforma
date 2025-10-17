'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ChartCardProps = {
  title: string;
  value: string;
  helperText?: string;
  trendLabel?: string;
  trendValue?: string;
  className?: string;
  children: ReactNode;
};

export function ChartCard({ title, value, helperText, trendLabel, trendValue, className, children }: ChartCardProps) {
  return (
    <div className={cn('flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          {helperText ? <p className="mt-1 text-xs text-slate-500">{helperText}</p> : null}
        </div>
        {trendLabel && trendValue ? (
          <div className="text-right">
            <p className="text-xs uppercase text-slate-400">{trendLabel}</p>
            <p className="text-sm font-medium text-slate-700">{trendValue}</p>
          </div>
        ) : null}
      </div>
      <div className="mt-6 h-48">{children}</div>
    </div>
  );
}
