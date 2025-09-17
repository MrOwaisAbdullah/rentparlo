'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryProvider } from '@/components/query-provider';
import { LoadingProvider } from '@/contexts/loading-context';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <LoadingProvider>
          {children}
          <Toaster />
        </LoadingProvider>
      </AuthProvider>
    </QueryProvider>
  );
}