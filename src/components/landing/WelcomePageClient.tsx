'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { HeroSection } from './HeroSection'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ShowcaseCard } from './data/showcaseCards'
import type { SpotCategory } from '@/types/spot'

const EntryPointSection = dynamic(() =>
  import('./EntryPointSection').then((mod) => mod.EntryPointSection)
)
const InformationStandardsSection = dynamic(() =>
  import('./InformationStandardsSection').then(
    (mod) => mod.InformationStandardsSection
  )
)
const StorytellingSection = dynamic(
  () => import('./StorytellingSection').then((mod) => mod.StorytellingSection),
  { ssr: false }
)
/**
 * 랜딩 페이지 클라이언트 컴포넌트
 * 정보 탐색 중심 섹션을 통합하고 디바이스 능력/모션 훅을 연결한다.
 */
interface WelcomePageClientProps {
  /** 서버에서 fetch한 쇼케이스 스팟 데이터 */
  showcaseSpots: ShowcaseCard[]
  /** 카테고리별 실제 스팟 이미지 */
  categoryImages: Record<SpotCategory, string>
}

export function WelcomePageClient({
  showcaseSpots,
  categoryImages,
}: WelcomePageClientProps) {
  const { isHighEnd, isReady } = useDeviceCapability()
  const reducedMotion = usePrefersReducedMotion()

  /** 페이지 이탈 시에도 has_visited 쿠키 설정 */
  useEffect(() => {
    const handleBeforeUnload = () => setHasVisitedCookie()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <HeroSection
        reducedMotion={reducedMotion}
        showcaseSpots={showcaseSpots}
      />

      <EntryPointSection />
      <div
        className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
        aria-hidden="true"
      />
      <StorytellingSection
        isHighEnd={isReady ? isHighEnd : false}
        reducedMotion={reducedMotion}
        categoryImages={categoryImages}
      />
      <InformationStandardsSection />
    </div>
  )
}

/**
 * has_visited 쿠키를 설정하여 다음 방문 시 /map으로 리다이렉트
 * 만료: 365일
 */
function setHasVisitedCookie() {
  const maxAge = 365 * 24 * 60 * 60 // 365일 (초)
  document.cookie = `has_visited=true; path=/; max-age=${maxAge}; SameSite=Lax`
}
