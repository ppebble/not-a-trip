import { Header } from '@/components/layout'
import { ShellProvidersLite } from '@/lib/shell-providers-lite'
import AppChromeDeferredHost from './AppChromeDeferredHost'

export default function AppShellLite({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ShellProvidersLite>
      <Header />
      <main>{children}</main>
      <AppChromeDeferredHost />
    </ShellProvidersLite>
  )
}
