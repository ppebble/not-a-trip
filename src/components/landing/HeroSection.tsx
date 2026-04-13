'use client'

import { forwardRef } from 'react'
import dynamic from 'next/dynamic'
import { CTAButton } from './CTAButton'
import { GlobeFallback2D } from './GlobeFallback2D'
import { GLOBE_DATA_POINTS } from './data/globeData'

/**
 * 히어로 섹션 컴포넌트
 * 3D 지구본(또는 2D 폴백) + 가치 제안 카피 + CTA 버튼으로 구성
 * Requirements: 1.1, 1.2, 1.5, 1.6, 6.4, 7.4
 */

interface HeroSectionProps {
  isHighEnd: boolean
  reducedMotion: boolean
}

/** Globe3D를 dynamic import로 로드 (SSR 비활성화, 번들 분리) */
const Globe3D = dynamic(() => import('./Globe3D').then((mod) => mod.Globe3D), {
  ssr: false,
  loading: () => (
    <GlobeFallback2D className="h-72 w-72 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]" />
  ),
})

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection({ isHighEnd, reducedMotion }, ref) {
    return (
      <section
        ref={ref}
        className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16"
        aria-label="히어로 섹션"
      >
        {/* 배경 그라데이션 */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary-50/30 via-transparent to-transparent dark:from-primary-900/20"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-8 lg:flex-row lg:gap-12">
          {/* 텍스트 + CTA 영역 */}
          <header className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="mb-4 text-3xl font-bold leading-tight text-main-text md:text-4xl lg:text-5xl">
              관광지가 아닌
              <br />
              <span className="text-primary-500">성지</span>를 탐험하세요
            </h1>
            <p className="mb-8 max-w-md text-base text-sub-text md:text-lg">
              애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등
              <br className="hidden sm:block" />
              팬들만 아는 특별한 여행지를 발견하세요.
            </p>
            <CTAButton label="지도 탐색하기" href="/map" size="lg" />
          </header>

          {/* 지구본 비주얼 영역 */}
          <div className="relative flex flex-1 items-center justify-center">
            {/* 3D/2D 지구본 분기 렌더링 */}
            {isHighEnd && !reducedMotion ? (
              <Globe3D
                dataPoints={GLOBE_DATA_POINTS}
                className="h-72 w-72 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]"
              />
            ) : (
              <GlobeFallback2D className="h-72 w-72 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]" />
            )}
          </div>
        </div>
      </section>
    )
  }
)
