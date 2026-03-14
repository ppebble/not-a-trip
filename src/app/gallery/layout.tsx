import type { Metadata } from 'next'
import { getBaseUrl } from '@/lib/seo/metadata'

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: '갤러리',
  description:
    '팬들의 순례 인증샷과 명예의 전당을 확인하세요. 애니메이션 성지순례, 콘서트, 스포츠 직관 등 특별한 순간을 공유합니다.',
  openGraph: {
    title: '갤러리 | Not a Trip',
    description:
      '팬들의 순례 인증샷과 명예의 전당을 확인하세요. 애니메이션 성지순례, 콘서트, 스포츠 직관 등 특별한 순간을 공유합니다.',
    url: `${baseUrl}/gallery`,
    type: 'website',
    siteName: 'Not a Trip',
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
