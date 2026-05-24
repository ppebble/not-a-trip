import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Header } from '@/components/layout'
import AppChromeDeferredHost from '@/components/app/AppChromeDeferredHost'
import JsonLd from '@/components/seo/JsonLd'
import GoogleAnalytics from '@/components/seo/GoogleAnalytics'
import { generateWebSiteJsonLd } from '@/lib/seo/json-ld'
import { getBaseUrl } from '@/lib/seo/metadata'

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

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | Not a Trip',
    default: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
  },
  description:
    '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
  alternates: {
    canonical: baseUrl,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Not a Trip',
  },
  openGraph: {
    siteName: 'Not a Trip',
    type: 'website',
    url: baseUrl,
    title: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
    description:
      '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
    images: [`${baseUrl}/api/og?type=default`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Not a Trip - ?щ뱾留??꾨뒗 ?밸퀎???ы뻾吏',
    description:
      '?좊땲硫붿씠???깆??쒕?, ?곹솕 珥ъ쁺吏, 肄섏꽌???μ냼 ???щ뱾留??꾨뒗 ?밸퀎???ы뻾吏瑜?諛쒓껄?섏꽭??',
    images: [`${baseUrl}/api/og?type=default`],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${pretendard.variable} antialiased`}>
        <GoogleAnalytics />
        <JsonLd data={generateWebSiteJsonLd()} />
        <Providers>
          <Header />
          <main>{children}</main>
          <AppChromeDeferredHost />
        </Providers>
      </body>
    </html>
  )
}
