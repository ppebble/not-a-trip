'use client'

import { useRef, useEffect } from 'react'
import { CATEGORY_STORIES } from './data/categoryStories'
import { CategoryCard } from './CategoryCard'

/**
 * 카테고리 스토리텔링 섹션
 * GSAP ScrollTrigger 기반 3D 팝업북 스타일 스크롤 애니메이션
 * Requirements: 2.1, 2.2, 2.3, 2.9, 5.3, 6.5, 7.6
 *
 * - isHighEnd === true && reducedMotion === false: GSAP 3D 팝업북 애니메이션
 * - isHighEnd === false: 단순 CSS 애니메이션 (페이드인/슬라이드인)
 * - reducedMotion === true: GSAP 비활성화, 정적 레이아웃
 */

interface StorytellingSectionProps {
  isHighEnd: boolean
  reducedMotion: boolean
}

export function StorytellingSection({
  isHighEnd,
  reducedMotion,
}: StorytellingSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // GSAP 애니메이션: 고성능 + 모션 허용 시에만 로드
  if (isHighEnd && !reducedMotion) {
    return (
      <StorytellingSectionWithGSAP
        containerRef={containerRef}
        isHighEnd={isHighEnd}
        reducedMotion={reducedMotion}
      />
    )
  }

  // CSS 폴백: 저사양 또는 reduced-motion
  return (
    <StorytellingSectionFallback
      isHighEnd={isHighEnd}
      reducedMotion={reducedMotion}
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
}: {
  containerRef: React.RefObject<HTMLDivElement | null>
  isHighEnd: boolean
  reducedMotion: boolean
}) {
  // GSAP는 dynamic import로 로드하여 번들 분리
  // useGSAP 훅은 scope 옵션으로 컨텍스트 자동 정리
  useGSAPAnimation(containerRef)

  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="카테고리 스토리텔링"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 섹션 헤더 */}
        <header className="mb-12 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-main-text md:text-3xl lg:text-4xl">
            어떤 <span className="text-primary-500">덕질</span>을 하시나요?
          </h2>
          <p className="text-base text-sub-text md:text-lg">
            카테고리별 성지순례 스팟을 탐험해 보세요
          </p>
        </header>

        {/* 카테고리 카드 그리드 */}
        <div
          ref={containerRef}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORY_STORIES.map((story, index) => (
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
}: {
  isHighEnd: boolean
  reducedMotion: boolean
}) {
  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="카테고리 스토리텔링"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 섹션 헤더 */}
        <header className="mb-12 text-center md:mb-16">
          <h2 className="mb-3 text-2xl font-bold text-main-text md:text-3xl lg:text-4xl">
            어떤 <span className="text-primary-500">덕질</span>을 하시나요?
          </h2>
          <p className="text-base text-sub-text md:text-lg">
            카테고리별 성지순례 스팟을 탐험해 보세요
          </p>
        </header>

        {/* 카테고리 카드 그리드 — CSS 애니메이션 */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_STORIES.map((story, index) => (
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
        const [gsapModule, scrollTriggerModule, gsapReactModule] =
          await Promise.all([
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
      } catch (error) {
        console.warn('GSAP 로드 실패, CSS 폴백 적용:', error)
        // GSAP 로드 실패 시 카드를 보이게 처리
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
