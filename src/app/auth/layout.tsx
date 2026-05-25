import { SessionOnlyProviders } from '@/lib/session-providers'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionOnlyProviders>{children}</SessionOnlyProviders>
}
