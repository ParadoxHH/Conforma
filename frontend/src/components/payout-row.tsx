'use client';

import { BadgeCheck, Clock3, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

type PayoutRowProps = {
  payout: {
    id: string;
    jobId: string;
    amount: number;
    type: 'STANDARD' | 'INSTANT';
    status: 'PENDING' | 'SENT' | 'SETTLED' | 'FAILED';
    createdAt: string;
    updatedAt?: string;
    processorRef?: string | null;
  };
};

const statusStyles: Record<PayoutRowProps['payout']['status'], string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  SENT: 'bg-blue-100 text-blue-700',
  SETTLED: 'bg-emerald-100 text-emerald-700',
  FAILED: 'bg-rose-100 text-rose-700',
};

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function PayoutRow({ payout }: PayoutRowProps) {
  const amountUsd = formatCurrency.format(payout.amount / 100);
  const created = new Date(payout.createdAt).toLocaleString();

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', payout.type === 'INSTANT' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600')}>
          {payout.type === 'INSTANT' ? <Send className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{amountUsd}</p>
          <p className="text-xs text-slate-500">Job #{payout.jobId}</p>
          <p className="text-xs text-slate-400">{created}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {payout.type === 'INSTANT' ? (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
            <BadgeCheck className="h-3 w-3" /> Instant
          </span>
        ) : null}
        <span className={cn('rounded-full px-3 py-1 text-xs font-medium', statusStyles[payout.status])}>
          {payout.status.toLowerCase()}
        </span>
      </div>
    </div>
  );
}
