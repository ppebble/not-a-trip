'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ProofCard } from './ProofCard'
import { LANDING_PROOF_CARDS } from './data/proofData'
import type { ProofData } from './data/proofData'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 섹션 컴포넌트
 * 커뮤니티 가치 카피 + ProofCard 무한 순환 슬라이더
 * 자동 스크롤 + 수동 좌우 스와이프 + 데스크톱 화살표 지원
 * Requirements: 3.1, 3.2, 3.3, 3.4, 6.6, 7.4, 9.3, 9.4
 */

/** 서버에서 전달받는 체크인 데이터 (M6 수정사항) */
export interface SocialProofCheckin {
  id: string
  spotName: string
  contentName?: string
  migrationStatus?: 'resolved' | 'unresolved' | null
  photoUrl: string
  comment?: string
  categoryTag: SpotCategory
}

interface SocialProofSectionProps {
  /** 카테고리별 실제 스팟 이미지 목록 */
  proofImages: Record<SpotCategory, string[]>
  /** 서버에서 가져온 체크인 데이터 (contentName 포함) */
  checkinData?: SocialProofCheckin[]
}

/** 자동 스크롤 간격 (ms) */
const AUTO_SCROLL_INTERVAL = 3500
/** 슬라이드 전환 시간 (ms) */
const TRANSITION_DURATION = 500
/** 카드 간 간격 (px) — gap-4 = 1rem = 16px */
const CARD_GAP = 16

/**
 * 무한 순환 구현:
 * 원본 카드 앞뒤에 클론을 배치하여 끊김 없는 루프를 만든다.
 * [clone-last-N] [original-0 ... original-N] [clone-first-N]
 * 클론 영역에 도달하면 transition 없이 원본 위치로 점프한다.
 */
const CLONE_COUNT = 4

/**
 * proofData의 카드별 스팟 사진을 유지하고 무한 순환용 클론을 생성한다.
 * - 각 카드가 특정 스팟을 표시하므로 카테고리 이미지 풀을 임의 배정하지 않는다.
 * - sceneImage는 실제 장면 이미지가 없으므로 제거 (단일 실사 카드)
 * - checkinData가 있으면 서버 체크인 데이터를 우선 사용
 * @public 테스트 가능하도록 export (Property 7 검증용)
 */
export function getExtendedData(
  _proofImages: Record<SpotCategory, string[]>,
  checkinData?: SocialProofCheckin[]
) {
  // checkinData가 있으면 서버 데이터를 더미 데이터 앞에 배치
  let baseData: ProofData[]

  if (checkinData && checkinData.length > 0) {
    // 서버 체크인 데이터를 ProofData 형태로 변환
    const checkinProofData: ProofData[] = checkinData.map((checkin) => {
      // contentName 표시 로직: Requirements 9.3, 9.4
      let displayContentName: string | undefined
      if (checkin.migrationStatus === 'unresolved') {
        displayContentName = '(미분류)'
      } else if (checkin.contentName) {
        displayContentName = checkin.contentName
      }

      return {
        id: `checkin-${checkin.id}`,
        categoryTag: checkin.categoryTag,
        spotName: checkin.spotName,
        contentName: displayContentName,
        comment: checkin.comment || '성지순례 인증!',
        image: checkin.photoUrl,
        sceneImage: undefined,
      }
    })

    // 서버 데이터 + 더미 데이터 결합 (서버 데이터 우선)
    baseData = [...checkinProofData, ...LANDING_PROOF_CARDS]
  } else {
    baseData = [...LANDING_PROOF_CARDS]
  }

  const data: ProofData[] = baseData.map((item) => ({
    ...item,
    sceneImage: undefined,
  }))

  const len = data.length
  const prefixClones = data.slice(-CLONE_COUNT).map((d, i) => ({
    ...d,
    id: `clone-pre-${i}`,
  }))
  const suffixClones = data.slice(0, CLONE_COUNT).map((d, i) => ({
    ...d,
    id: `clone-suf-${i}`,
  }))
  return { extended: [...prefixClones, ...data, ...suffixClones], len }
}

export function SocialProofSection({
  proofImages,
  checkinData,
}: SocialProofSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const reducedMotion = usePrefersReducedMotion()

  const { extended, len } = getExtendedData(proofImages, checkinData)
  // 실제 인덱스 0 = extended 배열의 CLONE_COUNT 위치
  const [currentIndex, setCurrentIndex] = useState(CLONE_COUNT)

  /** 카드 1개 너비 + gap 계산 */
  const getCardStep = useCallback(() => {
    const slider = sliderRef.current
    if (!slider) return 0
    const firstCard = slider.querySelector<HTMLElement>('[data-card]')
    if (!firstCard) return 0
    return firstCard.offsetWidth + CARD_GAP
  }, [])

  /** 슬라이드 위치 계산 */
  const getTranslateX = useCallback(
    (index: number) => {
      const step = getCardStep()
      return -(index * step)
    },
    [getCardStep]
  )

  /** 클론 영역 도달 시 원본 위치로 점프 (transition 없이) */
  useEffect(() => {
    if (isTransitioning) return

    let jumpIndex: number | null = null
    if (currentIndex >= len + CLONE_COUNT) {
      // 끝 클론 → 원본 시작으로
      jumpIndex = currentIndex - len
    } else if (currentIndex < CLONE_COUNT) {
      // 앞 클론 → 원본 끝으로
      jumpIndex = currentIndex + len
    }

    if (jumpIndex !== null) {
      const target = jumpIndex
      // 다음 프레임에서 transition 없이 점프
      requestAnimationFrame(() => {
        setIsTransitioning(false)
        setCurrentIndex(target)
        // 점프 후 다시 transition 활성화
        requestAnimationFrame(() => {
          setIsTransitioning(true)
        })
      })
    }
  }, [currentIndex, isTransitioning, len])

  /** 다음 카드로 이동 */
  const goNext = useCallback(() => {
    if (isTransitioning) return // transition 중 클릭 무시
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev + 1)
  }, [isTransitioning])

  /** 이전 카드로 이동 */
  const goPrev = useCallback(() => {
    if (isTransitioning) return // transition 중 클릭 무시
    setIsTransitioning(true)
    setCurrentIndex((prev) => prev - 1)
  }, [isTransitioning])

  /** transition 종료 감지 → 클론 점프 트리거 */
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  /** 자동 스크롤 */
  useEffect(() => {
    if (reducedMotion || isPaused) return
    const timer = setInterval(goNext, AUTO_SCROLL_INTERVAL)
    return () => clearInterval(timer)
  }, [reducedMotion, isPaused, goNext])

  /** 터치 스와이프 지원 */
  const touchStartX = useRef(0)
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true)
    touchStartX.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext()
      else goPrev()
    }
    setIsPaused(false)
  }

  return (
    <section
      className="relative overflow-hidden bg-background py-16 md:py-24"
      aria-label="소셜 프루프"
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* 섹션 헤더 */}
        <header className="mb-10 text-center md:mb-14">
          <h2 className="mb-3 text-2xl font-semibold tracking-[-0.025em] text-main-text md:text-3xl lg:text-4xl">
            다른 팬들은{' '}
            <span className="text-primary-500">이렇게 다녀왔어요</span>
          </h2>
          <p className="text-base leading-7 text-sub-text md:text-lg">
            인증 사진과 짧은 후기로 현장 분위기를 먼저 살펴보세요
          </p>
        </header>

        {/* 슬라이더 + 화살표 컨테이너 */}
        <div className="relative flex items-center gap-3 md:gap-5">
          {/* 좌측 화살표 (데스크톱 전용) */}
          <button
            type="button"
            onClick={goPrev}
            className="hidden shrink-0 rounded-full border border-border bg-surface/90 p-3 text-sub-text shadow-sm transition-colors hover:border-primary-500/40 hover:bg-background hover:text-main-text dark:border-white/10 md:block"
            aria-label="이전 카드"
          >
            <ChevronLeftIcon />
          </button>

          {/* 슬라이더 뷰포트 */}
          <div
            className="min-w-0 flex-1 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={sliderRef}
              className="flex gap-4"
              role="list"
              aria-label="성지순례 인증 카드 목록"
              style={{
                transform: `translateX(${getTranslateX(currentIndex)}px)`,
                transition: isTransitioning
                  ? `transform ${TRANSITION_DURATION}ms ease-in-out`
                  : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {extended.map((proof) => (
                <div
                  key={proof.id}
                  data-card
                  className="w-[85vw] shrink-0 sm:w-64 md:w-72 [&>article]:w-full"
                  role="listitem"
                >
                  <ProofCard
                    categoryTag={proof.categoryTag}
                    spotName={proof.spotName}
                    contentName={proof.contentName}
                    comment={proof.comment}
                    image={proof.image}
                    sceneImage={proof.sceneImage}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 우측 화살표 (데스크톱 전용) */}
          <button
            type="button"
            onClick={goNext}
            className="hidden shrink-0 rounded-full border border-border bg-surface/90 p-3 text-sub-text shadow-sm transition-colors hover:border-primary-500/40 hover:bg-background hover:text-main-text dark:border-white/10 md:block"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
