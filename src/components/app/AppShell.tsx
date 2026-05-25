import { Header } from '@/components/layout'
import { Providers } from '@/lib/providers'
import AppChromeDeferredHost from './AppChromeDeferredHost'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main>{children}</main>
      <AppChromeDeferredHost />
    </Providers>
  )
}
