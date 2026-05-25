import AppShell from '@/components/app/AppShell'

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>
}
