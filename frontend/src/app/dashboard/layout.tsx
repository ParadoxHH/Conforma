'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';

const baseLinks = [
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/reviews', label: 'Reviews' },
  { href: '/dashboard/verification', label: 'Verification' },
];

const contractorExtras = [
  { href: '/dashboard/billing', label: 'Billing' },
  { href: '/dashboard/payouts', label: 'Payouts' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/referrals', label: 'Referrals' },
];

const homeownerExtras = [
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/referrals', label: 'Referrals' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirect = encodeURIComponent(pathname || '/dashboard/profile');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, user, pathname, router]);

  const navLinks = useMemo(() => {
    if (!user) {
      return [];
    }

    if (user.role === 'CONTRACTOR') {
      return [...baseLinks, ...contractorExtras];
    }

    if (user.role === 'HOMEOWNER') {
      return [...baseLinks, ...homeownerExtras];
    }

    return baseLinks;
  }, [user]);

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white/80">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-6 text-sm text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
          {loading ? 'Loading your dashboard…' : 'Redirecting you to login…'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80">
      <div className="container grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:px-6">
        <nav className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Dashboard</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
                    }`}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="min-h-[60vh] rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-900/10 backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
