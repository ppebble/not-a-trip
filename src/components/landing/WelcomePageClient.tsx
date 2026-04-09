'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * 랜딩 페이지 클라이언트 컴포넌트 (스켈레톤)
 * 추후 HeroSection, StorytellingSection, SocialProofSection,
 * ConversionSection, FloatingCTA 등을 통합할 예정
 * Requirements: 1.8, 1.9
 */
export function WelcomePageClient() {
  const router = useRouter()

  /** 페이지 이탈 시에도 has_visited 쿠키 설정 */
  useEffect(() => {
    const handleBeforeUnload = () => setHasVisitedCookie()
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  /** CTA 클릭 시 has_visited 쿠키 설정 후 /map으로 이동 */
  const handleExplore = useCallback(() => {
    setHasVisitedCookie()
    router.push('/map')
  }, [router])

  return (
    <div className="min-h-screen bg-background">
      {/* TODO: HeroSection */}
      {/* TODO: StorytellingSection */}
      {/* TODO: SocialProofSection */}
      {/* TODO: ConversionSection */}
      {/* TODO: FloatingCTA */}

      {/* 임시 CTA — 추후 HeroSection으로 대체 */}
      <section className="flex min-h-screen flex-col items-center justify-center px-4">
        <h1 className="mb-4 text-3xl font-bold text-main-text">
          관광지가 아닌 성지를 탐험하세요
        </h1>
        <p className="mb-8 text-center text-sub-text">
          애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등
          <br />
          팬들만 아는 특별한 여행지를 발견하세요.
        </p>
        <button
          onClick={handleExplore}
          className="rounded-lg bg-primary px-6 py-3 text-white transition-colors hover:bg-primary-600"
        >
          지도 탐색하기
        </button>
      </section>
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
