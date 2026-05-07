import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import { Providers } from '@/lib/providers'
import { Header } from '@/components/layout'
import {
  SerwistRegistration,
  InstallPromptListener,
  InstallBottomSheet,
  InstallToast,
  IosPwaGuide,
} from '@/components/pwa'
import { CourseProgressBanner } from '@/components/course/CourseProgressBanner'
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
  title: {
    template: '%s | Not a Trip',
    default: 'Not a Trip - 팬들만 아는 특별한 여행지',
  },
  description:
    '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
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
    title: 'Not a Trip - 팬들만 아는 특별한 여행지',
    description:
      '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
    images: [`${baseUrl}/api/og?type=default`],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Not a Trip - 팬들만 아는 특별한 여행지',
    description:
      '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
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
          <CourseProgressBanner />
          <InstallPromptListener />
          <InstallBottomSheet />
          <InstallToast />
          <IosPwaGuide />
          <SerwistRegistration />
        </Providers>
      </body>
    </html>
  )
}
