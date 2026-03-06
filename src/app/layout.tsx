import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Header } from '@/components/layout'
import { ServiceWorkerRegistrar } from '@/components/mobile/ServiceWorkerRegistrar'
import { IosPwaPrompt } from '@/components/mobile/IosPwaPrompt'

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
  weight: '45 920',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#4164a5',
}

export const metadata: Metadata = {
  title: 'Not a Trip',
  description: '특별한 여행지를 공유하고 탐색하는 플랫폼',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Not a Trip',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${pretendard.variable} antialiased`}>
        <Providers>
          <Header />
          <main className="pt-14">{children}</main>
          <ServiceWorkerRegistrar />
          <IosPwaPrompt />
        </Providers>
      </body>
    </html>
  )
}
