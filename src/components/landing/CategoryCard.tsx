'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getSafeImageSrc, isRemoteImageSrc } from '@/lib/safe-image-src'
import type { SpotCategory } from '@/types/spot'

const CATEGORY_META: Record<
  SpotCategory,
  {
    eyebrow: string
    routeHint: string
  }
> = {
  animation: {
    eyebrow: 'ANIME PILGRIMAGE',
    routeHint: '장면 배경 · 성지순례',
  },
  sports: {
    eyebrow: 'SPORTS VENUE',
    routeHint: '경기장 · 팬 투어',
  },
  movie_drama: {
    eyebrow: 'SCREEN LOCATION',
    routeHint: '영화 · 드라마 촬영지',
  },
  music: {
    eyebrow: 'MUSIC LANDMARK',
    routeHint: '공연장 · 아티스트 장소',
  },
  game: {
    eyebrow: 'GAME WORLD',
    routeHint: '게임 배경 · 테마 스팟',
  },
  other: {
    eyebrow: 'CULTURE SPOT',
    routeHint: '숨은 명소 · 팬덤 장소',
  },
}

interface CategoryCardProps {
  category: SpotCategory
  title: string
  description: string
  mascotProp: string
  spotImage: string
  colorToken: string
  index: number
  isHighEnd: boolean
  reducedMotion: boolean
}

function getCategoryStyles(colorToken: string) {
  return {
    backgroundColor: `rgb(var(--${colorToken}-bg) / 0.16)`,
  }
}

function getAccentStyle(colorToken: string) {
  return {
    color: `rgb(var(--${colorToken}-fg))`,
  }
}

function getAccentSurfaceStyle(colorToken: string) {
  return {
    backgroundColor: `rgb(var(--${colorToken}-fg) / 0.1)`,
    borderColor: `rgb(var(--${colorToken}-fg) / 0.18)`,
    color: `rgb(var(--${colorToken}-fg))`,
  }
}

function getPhotoFallbackStyle(colorToken: string) {
  return {
    background:
      `radial-gradient(circle at 22% 18%, rgb(var(--${colorToken}-fg) / 0.24), transparent 34%), ` +
      `linear-gradient(135deg, rgb(var(--${colorToken}-bg) / 0.88), rgb(var(--surface) / 0.9))`,
  }
}

export function CategoryCard({
  category,
  title,
  description,
  spotImage,
  colorToken,
  index,
  isHighEnd,
  reducedMotion,
}: CategoryCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const meta = CATEGORY_META[category]
  const cardStyles = getCategoryStyles(colorToken)
  const accentStyles = getAccentStyle(colorToken)
  const chipStyles = getAccentSurfaceStyle(colorToken)
  const safeSpotImage = getSafeImageSrc(spotImage)

  return (
    <article
      className={`category-card group relative flex min-h-[25rem] flex-col overflow-hidden rounded-[1.6rem] shadow-lg shadow-primary-500/5 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 ${
        !reducedMotion && isHighEnd ? 'hover:-translate-y-1' : ''
      }`}
      style={{
        ...cardStyles,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
      }}
      data-index={index}
      data-category={category}
    >
      <div className="relative overflow-hidden p-5 pb-0">
        <div
          className="relative h-48 overflow-hidden rounded-[1.25rem] shadow-inner"
          style={getPhotoFallbackStyle(colorToken)}
        >
          {!imageFailed ? (
            <Image
              src={safeSpotImage}
              alt={`${title} 대표 스팟 사진`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              unoptimized={isRemoteImageSrc(safeSpotImage)}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
              <span className="text-sm font-semibold text-sub-text">
                대표 스팟 사진을 불러오지 못했습니다
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/20" />

          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full border border-white/30 bg-black/35 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {meta.eyebrow}
            </span>
            <span className="rounded-full bg-black/35 px-2 py-1 text-xs font-semibold text-white/85 backdrop-blur-sm">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="absolute inset-x-4 bottom-4">
            <p className="text-xs font-semibold text-white/80">
              {meta.routeHint}
            </p>
            <p className="mt-1 line-clamp-1 text-lg font-black tracking-[-0.03em] text-white">
              {title}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <h3
            className="text-xl font-semibold tracking-[-0.02em] md:text-2xl"
            style={accentStyles}
          >
            {title}
          </h3>
          <span
            className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: `rgb(var(--${colorToken}-fg))` }}
            aria-hidden="true"
          />
        </div>

        <p className="text-sm leading-relaxed text-sub-text md:text-base">
          {description}
        </p>

        <Link
          href={`/map?category=${category}`}
          className="mt-auto inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-semibold transition-colors hover:bg-background/70"
          style={chipStyles}
        >
          지도에서 보기
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  )
}
