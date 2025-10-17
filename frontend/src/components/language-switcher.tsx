'use client';

import { useTranslation } from '@/i18n/translation-context';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useTranslation();

  const toggle = () => {
    setLocale(locale === 'en' ? 'es' : 'en');
  };

  const nextLabel = locale === 'en' ? 'spanish' : 'english';

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={`${t('common.language.label')}: ${t(`common.language.${nextLabel}`)}`}
      className="text-sm font-medium text-slate-600 hover:text-primary"
    >
      {locale === 'en' ? t('common.language.spanish') : t('common.language.english')}
    </Button>
  );
}
