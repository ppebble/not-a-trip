import type { Metadata } from 'next'
import AppShell from '@/components/app/AppShell'
import { getBaseUrl } from '@/lib/seo/metadata'

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: '코스',
  description:
    '다른 팬들이 만든 코스를 탐색하고 따라가보세요. 애니메이션, 영화 촬영지, 콘서트 명소 등 테마별 코스를 제공합니다.',
  openGraph: {
    title: '코스 | Not a Trip',
    description:
      '다른 팬들이 만든 코스를 탐색하고 따라가보세요. 애니메이션, 영화 촬영지, 콘서트 명소 등 테마별 코스를 제공합니다.',
    url: `${baseUrl}/routes`,
    type: 'website',
    siteName: 'Not a Trip',
    images: [`${baseUrl}/api/og?type=default`],
  },
}

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
