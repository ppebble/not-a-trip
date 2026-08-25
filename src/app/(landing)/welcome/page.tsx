import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { WelcomePageClient } from '@/components/landing/WelcomePageClient'
import {
  fetchShowcaseSpots,
  fetchCategoryImages,
} from '@/components/landing/data/fetchShowcaseSpots'
import { auth } from '@/lib/auth'
import {
  SITE_NAME,
  getCanonicalUrl,
  getDefaultOgImage,
} from '@/lib/seo/metadata'

export const metadata: Metadata = {
  title: '작품 속 실제 장소 정보',
  description:
    '애니메이션, 영화, 스포츠, 음악과 게임 속 실제 장소를 작품별로 찾고 지도 위치와 추천 방문 코스를 확인하세요.',
  alternates: {
    canonical: getCanonicalUrl('/welcome'),
  },
  openGraph: {
    title: 'Not a Trip - 작품 속 실제 장소 정보 가이드',
    description:
      '작품별 실제 장소, 지도 위치, 추천 방문 코스를 한곳에서 확인하세요.',
    url: getCanonicalUrl('/welcome'),
    type: 'website',
    siteName: SITE_NAME,
    images: [getDefaultOgImage()],
  },
}

export default async function WelcomePage() {
  const session = await auth()
  if (session?.user) {
    redirect('/map')
  }

  const [showcaseSpots, categoryImages] = await Promise.all([
    fetchShowcaseSpots(),
    fetchCategoryImages(),
  ])
  return (
    <WelcomePageClient
      showcaseSpots={showcaseSpots}
      categoryImages={categoryImages}
    />
  )
}
