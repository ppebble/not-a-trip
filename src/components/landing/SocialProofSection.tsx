'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProofCard } from './ProofCard'
import { PROOF_DUMMY_DATA } from './data/proofData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * 소셜 프루프 섹션 컴포넌트
 * 커뮤니티 가치 카피 + ProofCard 가로 슬라이더
 * 자동 스크롤 + 수동 좌우 스와이프 지원
 * Requirements: 3.1, 3.2, 3.3, 3.4, 6.6, 7.4
 */

/** 자동 스크롤 간격 (ms) */
const AUTO_SCROLL_INTERVAL = 3500

export function SocialProofSection() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  /** 한 카드 너비만큼 스크롤 */
  const scrollByOneCard = useCallback(() => {
    const slider = sliderRef.current
    if (!slider) return

    const cardWidth = slider.querySelector('article')?.offsetWidth ?? 0
    const gap = 16 // gap-4 = 1rem = 16px
    const scrollAmount = cardWidth + gap
    const maxScroll = slider.scrollWidth - slider.clientWidth

    if (slider.scrollLeft >= maxScroll - 2) {
      // 끝에 도달하면 처음으로 돌아감
      slider.scrollTo({ left: 0, behavior: 'smooth' })
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }, [])

  /** 자동 스크롤: reduced-motion 비활성 & 일시정지 아닐 때만 */
  useEffect(() => {
    if (reducedMotion || isPaused) return

    const timer = setInterval(scrollByOneCard, AUTO_SCROLL_INTERVAL)
    return () => clearInterval(timer)
  }, [reducedMotion, isPaused, scrollByOneCard])

  /** 데스크톱 좌/우 화살표 버튼 핸들러 */
  const scrollLeft = () => {
    const slider = sliderRef.current
    if (!slider) return
    const cardWidth = slider.querySelector('article')?.offsetWidth ?? 0
    slider.scrollBy({ left: -(cardWidth + 16), behavior: 'smooth' })
  }

  const scrollRight = () => {
    scrollByOneCard()
  }

  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="소셜 프루프"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 섹션 헤더 */}
        <header className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-2xl font-bold text-main-text md:text-3xl lg:text-4xl">
            함께 <span className="text-primary-500">덕질</span>하는 즐거움
          </h2>
          <p className="text-base text-sub-text md:text-lg">
            다른 팬들의 성지순례 경험을 만나보세요
          </p>
        </header>

        {/* 슬라이더 컨테이너 */}
        <div className="relative">
          {/* 좌측 화살표 (데스크톱 전용) */}
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute -left-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-sub-text shadow-sm transition-colors hover:bg-background hover:text-main-text md:block"
            aria-label="이전 카드"
          >
            <ChevronLeftIcon />
          </button>

          {/* 슬라이더 */}
          <div
            ref={sliderRef}
            className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 py-2"
            role="list"
            aria-label="성지순례 인증 카드 목록"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {PROOF_DUMMY_DATA.map((proof) => (
              <div
                key={proof.id}
                className="w-[85vw] shrink-0 snap-start sm:w-64 md:w-72 [&>article]:w-full"
                role="listitem"
              >
                <ProofCard
                  categoryTag={proof.categoryTag}
                  spotName={proof.spotName}
                  comment={proof.comment}
                  image={proof.image}
                />
              </div>
            ))}
          </div>

          {/* 우측 화살표 (데스크톱 전용) */}
          <button
            type="button"
            onClick={scrollRight}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-border bg-surface p-2 text-sub-text shadow-sm transition-colors hover:bg-background hover:text-main-text md:block"
            aria-label="다음 카드"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

/** 좌측 화살표 아이콘 */
function ChevronLeftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

/** 우측 화살표 아이콘 */
function ChevronRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
