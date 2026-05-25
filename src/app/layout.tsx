import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import 'leaflet/dist/leaflet.css'
import './globals.css'
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
    default: 'Not a Trip - 애니메이션·영화 성지순례 여행 기록',
  },
  description:
    '애니메이션과 영화의 배경지를 찾아, 덕질 경험을 기록하고 공유하는 성지순례 여행 플랫폼입니다.',
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
    title: 'Not a Trip - 애니메이션·영화 성지순례 여행 기록',
    description:
      '애니메이션과 영화의 배경지를 찾아, 덕질 경험을 기록하고 공유하는 성지순례 여행 플랫폼입니다.',
    images: [`${baseUrl}/api/og?type=default`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Not a Trip - 애니메이션·영화 성지순례 여행 기록',
    description:
      '애니메이션과 영화의 배경지를 찾아, 덕질 경험을 기록하고 공유하는 성지순례 여행 플랫폼입니다.',
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
        {children}
      </body>
    </html>
  )
}
