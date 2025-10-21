'use client';

import Link from 'next/link';

import { useAuth } from '@/components/auth-context';
import { NotificationBell } from '@/components/notification-bell';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/i18n/translation-context';
import { LanguageSwitcher } from '@/components/language-switcher';

export function Header() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">{t('common.brand')}</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/how-it-works">{t('common.nav.howItWorks')}</Link>
            <Link href="/homeowners">{t('common.nav.homeowners')}</Link>
            <Link href="/contractors">{t('common.nav.contractors')}</Link>
            <Link href="/blog">{t('common.nav.blog')}</Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-3">
          <LanguageSwitcher />
          <Link
            href="/contractors"
            className="text-sm font-medium text-slate-600 transition hover:text-primary md:hidden"
          >
            {t('common.nav.contractors')}
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-slate-600 transition hover:text-primary"
              >
                {t('common.actions.dashboard')}
              </Link>
              {user.role === 'ADMIN' ? (
                <>
                  <Link
                    href="/admin/risk"
                    className="hidden text-sm font-medium text-slate-600 transition hover:text-primary lg:inline-flex"
                  >
                    Risk
                  </Link>
                  <Link
                    href="/autonomy"
                    className="hidden text-sm font-medium text-slate-600 transition hover:text-primary lg:inline-flex"
                  >
                    Autonomy
                  </Link>
                </>
              ) : null}
              <NotificationBell />
              <Button type="button" variant="outline" size="sm" onClick={logout}>
                {t('common.actions.logout')}
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t('common.actions.accessConforma')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
