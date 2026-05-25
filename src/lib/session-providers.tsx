'use client'

import { SessionProvider } from 'next-auth/react'

interface SessionOnlyProvidersProps {
  children: React.ReactNode
}

export function SessionOnlyProviders({ children }: SessionOnlyProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>
}
