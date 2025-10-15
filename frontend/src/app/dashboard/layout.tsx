import Link from 'next/link';

const links = [
  { href: '/dashboard/profile', label: 'Profile' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/reviews', label: 'Reviews' },
  { href: '/dashboard/verification', label: 'Verification' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/80">
      <div className="container grid gap-6 px-4 py-8 md:grid-cols-[220px_1fr] md:px-6">
        <nav className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Dashboard</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.href}>
                <Link className="block rounded-xl px-3 py-2 text-slate-600 transition hover:bg-primary/5 hover:text-primary" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-h-[60vh] rounded-3xl border border-white/60 bg-white/90 p-6 shadow-lg shadow-slate-900/10 backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  );
}
