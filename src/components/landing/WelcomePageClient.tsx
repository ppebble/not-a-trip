'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { HeroSection } from './HeroSection'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { ShowcaseCard } from './data/showcaseCards'
import type { SpotCategory } from '@/types/spot'

const EntryPointSection = dynamic(() =>
  import('./EntryPointSection').then((mod) => mod.EntryPointSection)
)
const HowItWorksSection = dynamic(
  () => import('./HowItWorksSection').then((mod) => mod.HowItWorksSection),
  { ssr: false }
)
const StorytellingSection = dynamic(
  () => import('./StorytellingSection').then((mod) => mod.StorytellingSection),
  { ssr: false }
)
const SocialProofSection = dynamic(
  () => import('./SocialProofSection').then((mod) => mod.SocialProofSection),
  { ssr: false }
)
const ConversionSection = dynamic(
  () => import('./ConversionSection').then((mod) => mod.ConversionSection),
  { ssr: false }
)
const FloatingCTA = dynamic(
  () => import('./FloatingCTA').then((mod) => mod.FloatingCTA),
  { ssr: false }
)

/**
 * 랜딩 페이지 클라이언트 컴포넌트
 * 모든 섹션을 통합하고 디바이스 능력/스크롤/모션 훅을 연결
 * Requirements: 5.2, 5.3, 5.4, 6.1, 6.2, 6.3
 */
interface WelcomePageClientProps {
  /** 서버에서 fetch한 쇼케이스 스팟 데이터 */
  showcaseSpots: ShowcaseCard[]
  /** 소셜 프루프용 카테고리별 스팟 이미지 목록 */
  categoryImages: Record<SpotCategory, string>
  proofImages: Record<string, string[]>
}

export function WelcomePageClient({
  showcaseSpots,
  categoryImages,
  proofImages,
}: WelcomePageClientProps) {
  const router = useRouter()
  const { isHighEnd, isReady } = useDeviceCapability()
  const reducedMotion = usePrefersReducedMotion()

  // 섹션 ref — useScrollPosition에 전달
  const heroRef = useRef<HTMLElement>(null)
  const conversionRef = useRef<HTMLElement>(null)

  const { heroExited, conversionVisible } = useScrollPosition({
    heroRef,
    conversionRef,
  })

  // PWA standalone 모드 감지
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  /** 페이지 이탈 시에도 has_visited 쿠키 설정 */
  useEffect(() => {
    const handleBeforeUnload = () => setHasVisitedCookie()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  // FloatingCTA 핸들러
  const handleInstallClick = async () => {
    // 설치 프롬프트 상태는 아래쪽 ConversionSection에서만 로드한다.
    // Floating CTA는 초기 번들을 줄이기 위해 설치 영역으로 이동만 담당한다.
    conversionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleExploreClick = () => {
    setHasVisitedCookie()
    router.push('/map')
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      {/* 히어로 — SSR 시점부터 바로 렌더 (스켈레톤 없음) */}
      <HeroSection
        ref={heroRef}
        reducedMotion={reducedMotion}
        showcaseSpots={showcaseSpots}
      />

      {/* EntryPointSection — 목적별 3개 카드 진입점 (Requirements 4.1) */}
      <EntryPointSection />

      {/* HowItWorks — 4단계 플로우 */}
      <HowItWorksSection />

      {/* StorytellingSection — 카테고리 스토리텔링 */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-primary-500/30 to-transparent"
        aria-hidden="true"
      />
      <StorytellingSection
        isHighEnd={isReady ? isHighEnd : false}
        reducedMotion={reducedMotion}
        categoryImages={categoryImages}
      />

      {/* SocialProofSection — 자동 스크롤 슬라이더 */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-border to-transparent dark:via-white/10"
        aria-hidden="true"
      />
      <SocialProofSection proofImages={proofImages} />

      {/* ConversionSection — PWA 설치 유도 전환 영역 */}
      <ConversionSection ref={conversionRef} isStandalone={isStandalone} />

      {/* FloatingCTA — Hero 이탈 후 ~ Conversion 진입 전 표시 */}
      <FloatingCTA
        visible={heroExited && !conversionVisible}
        isStandalone={isStandalone}
        onInstallClick={handleInstallClick}
        onExploreClick={handleExploreClick}
      />
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
