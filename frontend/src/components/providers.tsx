'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/components/auth-context';
import { TranslationProvider } from '@/i18n/translation-context';

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider>
        <AuthProvider>{children}</AuthProvider>
      </TranslationProvider>
    </QueryClientProvider>
  );
}
