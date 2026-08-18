import type { Metadata } from 'next'
import { SessionOnlyProviders } from '@/lib/session-providers'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionOnlyProviders>{children}</SessionOnlyProviders>
}
