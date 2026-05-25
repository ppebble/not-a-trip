'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import SentryUserManagerHost from '@/components/common/SentryUserManagerHost'

interface ShellProvidersLiteProps {
  children: React.ReactNode
}

export function ShellProvidersLite({ children }: ShellProvidersLiteProps) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SentryUserManagerHost />
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
