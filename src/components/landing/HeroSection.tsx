'use client'

import { forwardRef } from 'react'
import { CTAButton } from './CTAButton'
import { FloatingCardsCollage } from './FloatingCardsCollage'

/**
 * 히어로 섹션 컴포넌트
 * 플로팅 카드 콜라주 + 가치 제안 카피 + CTA 버튼으로 구성
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

interface HeroSectionProps {
  reducedMotion: boolean
}

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection({ reducedMotion }, ref) {
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

          {/* 플로팅 카드 콜라주 비주얼 영역 */}
          <div className="relative flex flex-1 items-center justify-center">
            <FloatingCardsCollage
              reducedMotion={reducedMotion}
              className="h-72 w-72 md:h-[400px] md:w-[400px] lg:h-[500px] lg:w-[500px]"
            />
          </div>
        </div>
      </section>
    )
  }
)
