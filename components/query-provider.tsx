'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

// Simple QueryProvider without complex initialization
export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  )

  // Check if queryClient is valid before using it
  if (!queryClient) {
    console.error('QueryClient failed to initialize')
    return <>{children}</>
  }

  try {
    // Check if QueryClientProvider is available and can be used
    if (typeof QueryClientProvider !== 'function') {
      console.error('QueryClientProvider is not a function')
      return <>{children}</>
    }

    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  } catch (error) {
    console.error('Error rendering QueryClientProvider:', error)
    return <>{children}</>
  }
}