'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'
import { SentryUserManager } from '@/components/common'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Create QueryClient instance with optimized configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: 5 minutes for spot data (relatively static)
            staleTime: 5 * 60 * 1000,
            // Cache time: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests up to 3 times
            retry: 3,
            // Retry delay with exponential backoff
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus disabled for performance
            refetchOnWindowFocus: false,
            // Don't refetch on reconnect to avoid excessive requests
            refetchOnReconnect: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SentryUserManager />
        <QueryClientProvider client={queryClient}>
          {children}
          <DevOnlyReactQueryDevtools />
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}

function DevOnlyReactQueryDevtools() {
  const [Devtools, setDevtools] = useState<React.ComponentType<{
    initialIsOpen?: boolean
  }> | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return
    }

    import('@tanstack/react-query-devtools').then((mod) => {
      setDevtools(() => mod.ReactQueryDevtools)
    })
  }, [])

  if (!Devtools) {
    return null
  }

  return <Devtools initialIsOpen={false} />
}
