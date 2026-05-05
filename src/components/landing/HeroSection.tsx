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
        className="relative flex min-h-screen flex-col overflow-hidden bg-background"
        aria-label="히어로 섹션"
      >
        {/* 랜딩 전용 미니 헤더 */}
        <LandingHeader />

        {/* 배경 글로우 블롭 */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[140px]"
            style={{
              background:
                'radial-gradient(circle, #7c3aed 0%, transparent 70%)',
            }}
          />
          <div
            className="absolute -bottom-32 right-0 h-[500px] w-[500px] rounded-full opacity-15 blur-[120px]"
            style={{
              background:
                'radial-gradient(circle, #1d4ed8 0%, transparent 70%)',
            }}
          />
          <div
            className="opacity-8 absolute left-1/2 top-1/2 h-[400px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
            style={{
              background:
                'radial-gradient(ellipse, #6d28d9 0%, transparent 70%)',
            }}
          />
        </div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-8 px-4 pb-16 pt-24 lg:flex-row lg:items-center lg:gap-12 lg:pt-0">
          {/* 좌측: 텍스트 + 검색 + 칩 */}
          <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-left">
            {/* 상단 뱃지 */}
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs font-medium text-primary-400">
              <span>🗺️</span>
              <span>팬들만 아는 특별한 여행지 플랫폼</span>
            </div>

            {/* 헤드라인 */}
            <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
              관광지가 아닌
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                성지
              </span>
              를 탐험하세요
            </h1>

            <p className="mb-8 max-w-md text-base text-white/60 md:text-lg">
              애니메이션 성지순례, 영화 촬영지, 콘서트 장소 등
              <br className="hidden sm:block" />
              팬들만 아는 특별한 여행지를 발견하세요.
            </p>

            {/* 검색창 */}
            <form onSubmit={handleSearch} className="mb-5 w-full max-w-md">
              <div className="bg-white/8 focus-within:bg-white/12 flex overflow-hidden rounded-xl border border-white/15 backdrop-blur-md transition-all focus-within:border-primary-500/60">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="작품명, 장소명으로 검색..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-white/40 outline-none"
                  aria-label="성지 검색"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-primary-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-600 active:scale-95"
                  aria-label="검색"
                >
                  <SearchIcon />
                  <span className="hidden sm:inline">탐색</span>
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
                  className="bg-white/8 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition hover:border-primary-500/50 hover:bg-primary-500/15 hover:text-white active:scale-95"
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
              className="pointer-events-none absolute inset-0 rounded-full opacity-25 blur-[70px]"
              style={{
                background:
                  'radial-gradient(circle, #7c3aed 0%, transparent 65%)',
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
          <div className="flex flex-col items-center gap-1 text-white/30">
            <span className="text-xs">스크롤하여 더 보기</span>
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
