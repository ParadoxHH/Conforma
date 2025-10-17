'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import en from './en.json';
import es from './es.json';

const dictionaries = {
  en,
  es,
} as const;

type Locale = keyof typeof dictionaries;

type TranslationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  get: <T = unknown>(key: string) => T | undefined;
};

const STORAGE_KEY = 'conforma.locale';

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined);

const getNestedValue = (key: string, locale: Locale) => {
  const segments = key.split('.');
  let value: unknown = dictionaries[locale];
  for (const segment of segments) {
    if (value && typeof value === 'object' && segment in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[segment];
    } else {
      value = undefined;
      break;
    }
  }

  if (value === undefined && locale !== 'en') {
    return getNestedValue(key, 'en');
  }

  return value;
};

const formatValue = (value: unknown, params?: Record<string, string | number>) => {
  if (typeof value !== 'string') {
    return value;
  }

  if (!params) {
    return value;
  }

  return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
    return acc.replace(`{{${paramKey}}}`, String(paramValue));
  }, value);
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === 'en' || stored === 'es') {
      setLocaleState(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    document.documentElement.lang = locale;
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
  }, []);

  const translate = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = getNestedValue(key, locale);
      const formatted = formatValue(value, params);
      if (typeof formatted === 'string') {
        return formatted;
      }
      return key;
    },
    [locale],
  );

  const getValue = useCallback(
    <T,>(key: string) => {
      const value = getNestedValue(key, locale);
      if (value !== undefined) {
        return value as T;
      }
      return getNestedValue(key, 'en') as T | undefined;
    },
    [locale],
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t: translate,
      get: getValue,
    }),
    [locale, setLocale, translate, getValue],
  );

  return <TranslationContext.Provider value={contextValue}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
