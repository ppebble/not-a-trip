'use client'

import { useEffect } from 'react'
import { HeroSection } from './HeroSection'
import { StorytellingSection } from './StorytellingSection'
import { useDeviceCapability } from '@/hooks/useDeviceCapability'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * 랜딩 페이지 클라이언트 컴포넌트
 * 디바이스 능력 감지 후 각 섹션에 3D/2D 분기 props 전달
 * Requirements: 1.8, 1.9, 5.2, 5.3
 */
export function WelcomePageClient() {
  const { isHighEnd, isReady } = useDeviceCapability()
  const reducedMotion = usePrefersReducedMotion()

  /** 페이지 이탈 시에도 has_visited 쿠키 설정 */
  useEffect(() => {
    const handleBeforeUnload = () => setHasVisitedCookie()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* 디바이스 감지 완료 전 스켈레톤 */}
      {!isReady ? (
        <HeroSkeleton />
      ) : (
        <HeroSection isHighEnd={isHighEnd} reducedMotion={reducedMotion} />
      )}

      {/* TODO: StorytellingSection */}
      {isReady && (
        <StorytellingSection
          isHighEnd={isHighEnd}
          reducedMotion={reducedMotion}
        />
      )}
      {/* TODO: SocialProofSection */}
      {/* TODO: ConversionSection */}
      {/* TODO: FloatingCTA */}
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
