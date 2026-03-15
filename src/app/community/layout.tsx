import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/seo/metadata'

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: '커뮤니티',
  description:
    '팬들과 함께 여행 경험을 나누고 정보를 공유하세요. 스팟 후기, 여행 팁, 작품 이야기를 자유롭게 나눌 수 있습니다.',
  openGraph: {
    title: '커뮤니티 | Not a Trip',
    description:
      '팬들과 함께 여행 경험을 나누고 정보를 공유하세요. 스팟 후기, 여행 팁, 작품 이야기를 자유롭게 나눌 수 있습니다.',
    url: `${baseUrl}/community`,
    type: 'website',
    siteName: 'Not a Trip',
    images: [`${baseUrl}/api/og?type=default`],
  },
}

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
