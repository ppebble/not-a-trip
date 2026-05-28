'use client'

import { forwardRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FloatingCardsCollage } from './FloatingCardsCollage'
import { LandingHeader } from './LandingHeader'
import type { ShowcaseCard } from './data/showcaseCards'

/**
 * 히어로 섹션 컴포넌트 — 발견형 검색 히어로
 * - 랜딩 전용 미니 헤더
 * - 강한 카피 + 검색창 + 카테고리 칩 6개
 * - 우측 플로팅 카드 콜라주 (실제 스팟 썸네일)
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */

interface HeroSectionProps {
  reducedMotion: boolean
  showcaseSpots: ShowcaseCard[]
}

const CATEGORY_CHIPS = [
  { label: '🎌 애니메이션', value: 'animation' },
  { label: '⚽ 스포츠', value: 'sports' },
  { label: '🎬 영화/드라마', value: 'movie_drama' },
  { label: '🎵 음악', value: 'music' },
  { label: '🎮 게임', value: 'game' },
  { label: '✨ 기타', value: 'other' },
]

export const HeroSection = forwardRef<HTMLElement, HeroSectionProps>(
  function HeroSection({ reducedMotion, showcaseSpots }, ref) {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/map?search=${encodeURIComponent(query.trim())}`)
      } else {
        router.push('/map')
      }
    }

    const handleChip = (category: string) => {
      router.push(`/map?category=${category}`)
    }

    return (
      <section
        ref={ref}
        className="relative flex min-h-screen flex-col overflow-visible bg-gradient-to-b from-primary-50 via-background to-background dark:from-slate-950 dark:via-background dark:to-background"
        aria-label="히어로 섹션"
      >
        {/* 랜딩 전용 미니 헤더 */}
        <LandingHeader />

        {/* 배경 글로우 블롭 */}
        <div
          className="pointer-events-none absolute -inset-x-16 -bottom-56 -top-24 overflow-visible"
          aria-hidden="true"
        >
          <div
            className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-25 blur-[140px] dark:opacity-20"
            style={{
              background:
                'radial-gradient(circle, #4f46e5 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-44 right-0 h-[560px] w-[560px] rounded-full opacity-20 blur-[120px] dark:opacity-15"
            style={{
              background:
                'radial-gradient(circle, #0d9488 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-64 left-1/2 h-[420px] w-[760px] -translate-x-1/2 rounded-full opacity-10 blur-[120px] dark:opacity-[0.12]"
            style={{
              background:
                'radial-gradient(ellipse, #f97316 0%, transparent 72%)',
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[100px] dark:opacity-[0.08]"
            style={{
              background:
                'radial-gradient(ellipse, #6366f1 0%, transparent 70%)',
            }}
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-4 pb-16 pt-24 lg:flex-row lg:items-center lg:gap-12 lg:pt-0">
          {/* 좌측: 텍스트 + 검색 + 칩 */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* 상단 뱃지 */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary-500/20 bg-surface/80 px-3 py-1 text-xs font-medium text-primary-700 shadow-sm backdrop-blur-sm dark:border-primary-400/25 dark:bg-white/10 dark:text-primary-300">
              <span>🗺️</span>
              <span>팬들이 남긴 실제 장소를 모아봤어요</span>
            </div>

            {/* 헤드라인 */}
            <h1 className="mb-5 text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-main-text md:text-5xl lg:text-6xl">
              좋아하는 장면을
              <br />
              <span className="text-primary-600 dark:text-primary-300">
                여행지
              </span>
              로 만나보세요
            </h1>

            <p className="mb-8 max-w-md text-base leading-7 text-sub-text md:text-lg md:leading-8">
              애니메이션 성지, 촬영지, 콘서트 장소까지.
              <br className="hidden sm:block" />
              지도에서 찾고 코스로 따라가며 방문 기록까지 남겨보세요.
            </p>

            {/* 검색창 */}
            <form onSubmit={handleSearch} className="mb-5 w-full max-w-md">
              <div className="flex overflow-hidden rounded-2xl border border-border bg-surface/90 shadow-xl shadow-primary-500/10 backdrop-blur-md transition-all focus-within:border-primary-500/60 focus-within:bg-background dark:border-white/15 dark:bg-white/10 dark:focus-within:bg-white/[0.14]">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="작품명, 장소명으로 검색..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-main-text placeholder-muted outline-none"
                  aria-label="성지 검색"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 active:scale-95"
                  aria-label="검색"
                >
                  <SearchIcon />
                  <span className="hidden sm:inline">찾기</span>
                </button>
              </div>
            </form>

            {/* 카테고리 칩 */}
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  onClick={() => handleChip(chip.value)}
                  className="rounded-full border border-border bg-surface/80 px-3 py-1.5 text-xs font-medium text-sub-text shadow-sm backdrop-blur-sm transition hover:border-secondary-500/50 hover:bg-secondary-50 hover:text-main-text active:scale-95 dark:border-white/15 dark:bg-white/10 dark:text-white/75 dark:hover:bg-secondary-500/15 dark:hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* 우측: 플로팅 카드 콜라주 */}
          <div className="relative flex flex-1 items-center justify-center">
            {/* 콜라주 뒤 글로우 */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-20 blur-[70px] dark:opacity-25"
              style={{
                background:
                  'radial-gradient(circle, #0d9488 0%, transparent 65%)',
              }}
              aria-hidden="true"
            />
            <FloatingCardsCollage
              reducedMotion={reducedMotion}
              showcaseSpots={showcaseSpots}
              className="h-80 w-80 md:h-[480px] md:w-[480px] lg:h-[min(640px,55vh)] lg:w-[min(640px,55vh)]"
            />
          </div>
        </div>

        {/* 하단 스크롤 힌트 */}
        <div
          className="relative z-10 flex justify-center pb-8"
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-1 text-muted dark:text-white/35">
            <span className="text-xs">아래에서 탐색 방법 보기</span>
            <ChevronDownIcon />
          </div>
        </div>
      </section>
    )
  }
)

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg
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
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}
