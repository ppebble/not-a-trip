import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import 'leaflet/dist/leaflet.css'
import './globals.css'
import JsonLd from '@/components/seo/JsonLd'
import GoogleAnalytics from '@/components/seo/GoogleAnalytics'
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
} from '@/lib/seo/json-ld'
import {
  DEFAULT_SEO_KEYWORDS,
  DEFAULT_SITE_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  getBaseUrl,
} from '@/lib/seo/metadata'

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
    default: DEFAULT_SITE_TITLE,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  keywords: DEFAULT_SEO_KEYWORDS,
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
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
    images: [`${baseUrl}/api/og?type=default`],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_SITE_DESCRIPTION,
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
        <JsonLd data={generateOrganizationJsonLd()} />
        {children}
      </body>
    </html>
  )
}
