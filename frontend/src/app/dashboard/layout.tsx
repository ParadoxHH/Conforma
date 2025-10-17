'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/components/auth-context';

const baseLinks = [\n  { href: '/dashboard/profile', label: 'Profile' },\n  { href: '/dashboard/messages', label: 'Messages' },\n  { href: '/dashboard/reviews', label: 'Reviews' },\n  { href: '/dashboard/verification', label: 'Verification' },\n];\n\nconst contractorExtras = [\n  { href: '/dashboard/billing', label: 'Billing' },\n  { href: '/dashboard/payouts', label: 'Payouts' },\n  { href: '/dashboard/analytics', label: 'Analytics' },\n  { href: '/dashboard/referrals', label: 'Referrals' },\n];\n\nconst homeownerExtras = [\n  { href: '/dashboard/analytics', label: 'Analytics' },\n  { href: '/dashboard/referrals', label: 'Referrals' },\n];\n\nexport default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const redirect = encodeURIComponent(pathname || '/dashboard/profile');
      router.replace(`/login?redirect=${redirect}`);
    }
  }, [loading, user, pathname, router]);

  const navLinks = useMemo(() => {\n    if (!user) {\n      return [];\n    }\n\n    if (user.role === 'CONTRACTOR') {\n      return [...baseLinks, ...contractorExtras];\n    }\n\n    if (user.role === 'HOMEOWNER') {\n      return [...baseLinks, ...homeownerExtras];\n    }\n\n    return baseLinks;\n  }, [user]);\n\n  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white/80">
        <div className="rounded-3xl border border-slate-200/70 bg-white/90 px-8 py-6 text-sm text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur">
          {loading ? 'Loading your dashboard...' : 'Redirecting you to login...'}
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



