'use client'

import { useRef, useEffect } from 'react'
import Image from 'next/image'
import { CATEGORY_STORIES } from './data/categoryStories'
import { CategoryCard } from './CategoryCard'
import { MASCOT_ASSETS } from '@/components/common/mascotAssets'
import type { SpotCategory } from '@/types/spot'

/**
 * 카테고리 스토리텔링 섹션
 * GSAP ScrollTrigger 기반 3D 팝업북 스타일 스크롤 애니메이션
 * Requirements: 2.1, 2.2, 2.3, 2.9, 5.3, 6.5, 7.6
 */

interface StorytellingSectionProps {
  isHighEnd: boolean
  reducedMotion: boolean
  categoryImages: Record<SpotCategory, string>
}

function SectionMascot() {
  return (
    <div className="mb-10 flex justify-center" aria-hidden="true">
      <Image
        src={MASCOT_ASSETS.peace}
        alt=""
        width={88}
        height={88}
        className="h-20 w-20 object-contain md:h-24 md:w-24"
      />
    </div>
  )
}

export function StorytellingSection({
  isHighEnd,
  reducedMotion,
  categoryImages,
}: StorytellingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // GSAP 애니메이션: 고성능 + 모션 허용 시에만 로드
  if (isHighEnd && !reducedMotion) {
    return (
      <StorytellingSectionWithGSAP
        containerRef={containerRef}
        isHighEnd={isHighEnd}
        reducedMotion={reducedMotion}
        stories={CATEGORY_STORIES}
        categoryImages={categoryImages}
      />
    )
  }

  return (
    <StorytellingSectionFallback
      isHighEnd={isHighEnd}
      reducedMotion={reducedMotion}
      stories={CATEGORY_STORIES}
      categoryImages={categoryImages}
    />
  )
}

/**
 * GSAP ScrollTrigger 기반 3D 팝업북 스타일 애니메이션 버전
 * @gsap/react의 useGSAP() 훅으로 React 18 Strict Mode 호환
 */
function StorytellingSectionWithGSAP({
  containerRef,
  isHighEnd,
  reducedMotion,
  stories,
  categoryImages,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  isHighEnd: boolean
  reducedMotion: boolean
  stories: typeof CATEGORY_STORIES
  categoryImages: Record<SpotCategory, string>
}) {
  useGSAPAnimation(containerRef)

  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="카테고리 스토리텔링"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-12 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl lg:text-4xl">
            취향별로 <span className="text-secondary-600">골라볼까요?</span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            장르마다 다른 분위기의 스팟을 카드로 먼저 살펴보세요
          </p>
        </header>

        <SectionMascot />

        <div
          ref={containerRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {stories.map((story, index) => (
            <div
              key={story.category}
              className="gsap-card"
              style={{
                opacity: 0,
                willChange: 'transform, opacity',
                transform: 'translate3d(0, 60px, 0) rotateX(15deg)',
              }}
            >
              <CategoryCard
                {...story}
                spotImage={categoryImages[story.category] || story.spotImage}
                index={index}
                isHighEnd={isHighEnd}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * CSS 페이드인/슬라이드인 폴백 버전
 * 저사양 기기 또는 prefers-reduced-motion 활성화 시 사용
 */
function StorytellingSectionFallback({
  isHighEnd,
  reducedMotion,
  stories,
  categoryImages,
}: {
  isHighEnd: boolean
  reducedMotion: boolean
  stories: typeof CATEGORY_STORIES
  categoryImages: Record<SpotCategory, string>
}) {
  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="카테고리 스토리텔링"
    >
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-12 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl lg:text-4xl">
            취향별로 <span className="text-secondary-600">골라볼까요?</span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            장르마다 다른 분위기의 스팟을 카드로 먼저 살펴보세요
          </p>
        </header>

        <SectionMascot />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story, index) => (
            <div
              key={story.category}
              className={
                reducedMotion
                  ? '' // reduced-motion: 애니메이션 없이 즉시 표시
                  : 'animate-fade-slide-in'
              }
              style={
                reducedMotion
                  ? undefined
                  : { animationDelay: `${index * 100}ms` }
              }
            >
              <CategoryCard
                {...story}
                spotImage={categoryImages[story.category] || story.spotImage}
                index={index}
                isHighEnd={isHighEnd}
                reducedMotion={reducedMotion}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * GSAP ScrollTrigger 애니메이션 훅
 * @gsap/react의 useGSAP()으로 React 18 Strict Mode 호환
 * scope 옵션으로 containerRef 내부만 타겟팅, 자동 클린업
 */
function useGSAPAnimation(
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  // dynamic import로 GSAP 로드 — 번들 분리
  const gsapRef = useRef<typeof import('gsap') | null>(null)
  const isLoadedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function loadAndAnimate() {
      try {
        const [gsapModule, scrollTriggerModule] = await Promise.all([
          import('gsap'),
          import('gsap/ScrollTrigger'),
          import('@gsap/react'),
        ])

        if (cancelled) return

        const gsap = gsapModule.default || gsapModule
        const { ScrollTrigger } = scrollTriggerModule

        gsap.registerPlugin(ScrollTrigger)
        gsapRef.current = gsapModule

        if (!containerRef.current) return

        const cards =
          containerRef.current.querySelectorAll<HTMLElement>('.gsap-card')

        cards.forEach((card, i) => {
          gsap.fromTo(
            card,
            {
              opacity: 0,
              y: 60,
              rotateX: 15,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              scale: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'top 50%',
                toggleActions: 'play none none reverse',
              },
              delay: (i % 3) * 0.15, // 같은 행 내 순차 딜레이
            }
          )
        })

        isLoadedRef.current = true
      } catch {
        // GSAP 로드 실패 시 CSS 폴백만 적용 (에러 로깅 필요 시 Sentry 사용)
        if (containerRef.current) {
          containerRef.current
            .querySelectorAll<HTMLElement>('.gsap-card')
            .forEach((card) => {
              card.style.opacity = '1'
              card.style.transform = 'none'
            })
        }
      }
    }

    loadAndAnimate()

    return () => {
      cancelled = true
      // ScrollTrigger 클린업
      if (gsapRef.current) {
        import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
          ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        })
      }
    }
  }, [containerRef])
}
