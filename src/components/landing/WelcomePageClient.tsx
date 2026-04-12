'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HeroSection } from './HeroSection'
import { StorytellingSection } from './StorytellingSection'
import { SocialProofSection } from './SocialProofSection'
import { ConversionSection } from './ConversionSection'
import { FloatingCTA } from './FloatingCTA'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { useScrollPosition } from '@/hooks/useScrollPosition'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { usePwaStore } from '@/stores/pwaStore'

/**
 * 랜딩 페이지 클라이언트 컴포넌트
 * 모든 섹션을 통합하고 디바이스 능력/스크롤/모션 훅을 연결
 * Requirements: 5.2, 5.3, 5.4, 6.1, 6.2, 6.3
 */
export function WelcomePageClient() {
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
  const triggerInstall = usePwaStore((s) => s.triggerInstall)

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
    await triggerInstall()
  }

  const handleExploreClick = () => {
    setHasVisitedCookie()
    router.push('/map')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 디바이스 감지 완료 전 스켈레톤 */}
      {!isReady ? (
        <HeroSkeleton />
      ) : (
        <HeroSection
          ref={heroRef}
          isHighEnd={isHighEnd}
          reducedMotion={reducedMotion}
        />
      )}

      {/* StorytellingSection — 카테고리 스토리텔링 */}
      {isReady && (
        <StorytellingSection
          isHighEnd={isHighEnd}
          reducedMotion={reducedMotion}
        />
      )}

      {/* SocialProofSection — 자동 스크롤 슬라이더 */}
      <SocialProofSection />

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

/** 디바이스 감지 중 표시할 히어로 스켈레톤 */
function HeroSkeleton() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
        <div className="flex flex-1 flex-col items-center gap-4 lg:items-start">
          <div className="h-10 w-64 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-6 w-48 animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-700" />
          <div className="h-12 w-36 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="h-64 w-64 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700 md:h-80 md:w-80" />
        </div>
      </div>
    </section>
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
