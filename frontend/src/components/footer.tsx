'use client';

import Link from 'next/link';

import { useTranslation } from '@/i18n/translation-context';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            {t('common.footer.copyright')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary">
            {t('common.footer.terms')}
          </Link>
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary">
            {t('common.footer.privacy')}
          </Link>
          <span className="text-sm text-muted-foreground">{t('common.footer.badge')}</span>
        </div>
      </div>
    </footer>
  );
}
