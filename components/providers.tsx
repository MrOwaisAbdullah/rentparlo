'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryProvider } from '@/components/query-provider';
import { LoadingProvider } from '@/contexts/loading-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <LoadingProvider>
          {children}
        </LoadingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}