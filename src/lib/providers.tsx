'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import { useEffect, useState } from 'react'
import SentryUserManagerHost from '@/components/common/SentryUserManagerHost'

interface ProvidersProps {
  children: React.ReactNode
}

function isRateLimitError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return (error as { status?: unknown }).status === 429
  }

  if (error instanceof Error) {
    return /(^|\s)429(\s|$)|Too Many Requests/i.test(error.message)
  }

  return false
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error) =>
              !isRateLimitError(error) && failureCount < 3,
            retryDelay: (attemptIndex) =>
              Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          },
          mutations: {
            retry: (failureCount, error) =>
              !isRateLimitError(error) && failureCount < 1,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SentryUserManagerHost />
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
