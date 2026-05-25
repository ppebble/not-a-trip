import AppShell from '@/components/app/AppShell'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
