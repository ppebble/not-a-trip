import type { Metadata } from 'next'
import AppShell from '@/components/app/AppShell'
import { getBaseUrl } from '@/lib/seo/metadata'

const baseUrl = getBaseUrl()

export const metadata: Metadata = {
  title: '갤러리',
  description:
    '팬들의 성지 인증과 명예의 전당을 확인하세요. 애니메이션, 영화, 스포츠 직관 등 다양한 현장 순간을 공유합니다.',
  openGraph: {
    title: '갤러리 | Not a Trip',
    description:
      '팬들의 성지 인증과 명예의 전당을 확인하세요. 애니메이션, 영화, 스포츠 직관 등 다양한 현장 순간을 공유합니다.',
    url: `${baseUrl}/gallery`,
    type: 'website',
    siteName: 'Not a Trip',
    images: [`${baseUrl}/api/og?type=default`],
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell>{children}</AppShell>
}
