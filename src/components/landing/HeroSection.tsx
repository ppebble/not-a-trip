'use client'

import dynamic from 'next/dynamic'
import { CTAButton } from './CTAButton'
import { GlobeFallback2D } from './GlobeFallback2D'
import type { SpotCategory } from '@/types/spot'

/**
 * 히어로 섹션 컴포넌트
 * 3D 지구본(또는 2D 폴백) + 가치 제안 카피 + CTA 버튼으로 구성
 * Requirements: 1.1, 1.2, 1.5, 1.6, 6.4, 7.4
 */

export interface GlobeDataPoint {
  lat: number
  lng: number
  label: string
  category: SpotCategory
  /** 핀 썸네일 이미지 URL (작품 이미지) */
  thumbnail?: string
}

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

/**
 * 더미 성지순례 포인트 데이터 (인기순 상위 12개)
 * 추후 실제 Spot API에서 인기순으로 가져올 예정
 * 전 세계에 골고루 분포되도록 구성
 */
const GLOBE_DATA_POINTS: GlobeDataPoint[] = [
  // 동아시아 (애니메이션/게임 성지)
  {
    lat: 35.6762,
    lng: 139.6503,
    label: '아키하바라',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 34.6937,
    lng: 135.5023,
    label: '도톤보리',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 37.5665,
    lng: 126.978,
    label: '홍대',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 25.033,
    lng: 121.5654,
    label: '시먼딩',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  // 유럽 (영화/스포츠)
  {
    lat: 48.8566,
    lng: 2.3522,
    label: '몽마르뜨',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 41.3874,
    lng: 2.1686,
    label: '캄프 누',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
  {
    lat: 51.5074,
    lng: -0.1278,
    label: '킹스크로스',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  // 북미 (게임/영화)
  {
    lat: 34.0522,
    lng: -118.2437,
    label: '할리우드',
    category: 'movie_drama',
    thumbnail: '/icons/categories/movie_drama.webp',
  },
  {
    lat: 40.7128,
    lng: -74.006,
    label: '타임스퀘어',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  // 오세아니아/동남아
  {
    lat: -33.8688,
    lng: 151.2093,
    label: '오페라하우스',
    category: 'music',
    thumbnail: '/icons/categories/music.webp',
  },
  {
    lat: 13.7563,
    lng: 100.5018,
    label: '카오산로드',
    category: 'other',
    thumbnail: '/icons/categories/other.webp',
  },
  // 중동
  {
    lat: 25.2048,
    lng: 55.2708,
    label: '두바이몰',
    category: 'game',
    thumbnail: '/icons/categories/game.webp',
  },
]

export function HeroSection({ isHighEnd, reducedMotion }: HeroSectionProps) {
  return (
    <section
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
