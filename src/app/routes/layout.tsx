import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/seo/metadata'

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: '코스',
  description:
    '다른 순례자들이 만든 코스를 탐색하고 따라가보세요. 애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 테마별 코스를 제공합니다.',
  openGraph: {
    title: '코스 | Not a Trip',
    description:
      '다른 순례자들이 만든 코스를 탐색하고 따라가보세요. 애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 테마별 코스를 제공합니다.',
    url: `${baseUrl}/routes`,
    type: 'website',
    siteName: 'Not a Trip',
  },
}

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
