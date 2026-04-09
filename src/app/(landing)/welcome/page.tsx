import type { Metadata } from 'next'
import { WelcomePageClient } from '@/components/landing/WelcomePageClient'

export const metadata: Metadata = {
  title: '환영합니다',
  description:
    '관광지가 아닌 성지를 탐험하세요. 애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
  openGraph: {
    title: 'Not a Trip - 관광지가 아닌 성지를 탐험하세요',
    description:
      '애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등 팬들만 아는 특별한 여행지를 발견하세요.',
  },
}

export default function WelcomePage() {
  return <WelcomePageClient />
}
