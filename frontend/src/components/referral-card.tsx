'use client';

import { useState } from 'react';
import { Button } from './ui/button';

export type ReferralSummary = {
  code: string;
  referredByCode?: string | null;
  stats: {
    signups: number;
    firstFundedJobs: number;
    credits: number;
  };
};

type ReferralCardProps = {
  summary: ReferralSummary;
};

export function ReferralCard({ summary }: ReferralCardProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase text-slate-500">Your Referral Code</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="rounded-2xl bg-slate-900 px-4 py-2 text-lg font-mono text-white">{summary.code}</span>
        <Button variant="outline" onClick={copyToClipboard}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{summary.stats.signups}</p>
          <p className="text-xs text-slate-500">Signups</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">{summary.stats.firstFundedJobs}</p>
          <p className="text-xs text-slate-500">Funded Jobs</p>
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900">{summary.stats.credits}</p>
          <p className="text-xs text-slate-500">Credits Available</p>
        </div>
      </div>
      {summary.referredByCode ? (
        <p className="mt-4 text-xs text-slate-500">
          You joined via code <span className="font-semibold text-slate-700">{summary.referredByCode}</span>
        </p>
      ) : null}
    </div>
  );
}
