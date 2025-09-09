'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryProvider } from '@/components/query-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}