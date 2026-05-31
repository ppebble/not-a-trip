'use client'

import Image from 'next/image'
import { useState } from 'react'

import { getSafeImageSrc } from '@/lib/safe-image-src'
import type { SpotCategory } from '@/types/spot'
import type { ShowcaseCard } from './data/showcaseCards'
import { getCategoryAccentColor } from './data/showcaseCards'

interface FloatingCardProps {
  card: ShowcaseCard
  index: number
  reducedMotion: boolean
  size: 'sm' | 'md' | 'lg'
}

const SIZE_CONFIG = {
  sm: { width: 120, height: 90 },
  md: { width: 160, height: 120 },
  lg: { width: 200, height: 150 },
} as const

const TEXT_SIZE_CONFIG = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const

const CATEGORY_LABEL: Record<SpotCategory, string> = {
  animation: '애니',
  sports: '스포츠',
  movie_drama: '영화',
  music: '음악',
  game: '게임',
  other: '기타',
}

const CATEGORY_GRADIENT: Record<SpotCategory, string> = {
  animation: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 50%, #1a0a3d 100%)',
  sports: 'linear-gradient(135deg, #0a2010 0%, #1a4a20 50%, #0a1a08 100%)',
  movie_drama: 'linear-gradient(135deg, #1a0a0a 0%, #4a1010 50%, #2a0808 100%)',
  music: 'linear-gradient(135deg, #0a0a2a 0%, #1a1a5a 50%, #0a0a3a 100%)',
  game: 'linear-gradient(135deg, #0a1a2a 0%, #103050 50%, #081520 100%)',
  other: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a3a 50%, #151520 100%)',
}

export function FloatingCard({
  card,
  index,
  reducedMotion,
  size,
}: FloatingCardProps) {
  const [imageFailed, setImageFailed] = useState(false)

  const { width, height } = SIZE_CONFIG[size]
  const accentColor = getCategoryAccentColor(card.category)
  const imageSrc = getSafeImageSrc(card.imageUrl)
  const altText = `${card.spotName} - ${card.contentName}`

  return (
    <div
      className="group relative rounded-[1rem] shadow-xl shadow-primary-500/10 backdrop-blur-sm transition-all duration-300 will-change-transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20"
      style={{
        width,
        height,
        background: CATEGORY_GRADIENT[card.category],
      }}
      data-index={index}
      data-reduced-motion={reducedMotion}
    >
      {card.additionalContentNames &&
        card.additionalContentNames.length > 0 && (
          <div
            className="absolute -right-1 -top-1 z-20 flex items-center justify-center rounded-full border border-border bg-surface/95 shadow-md backdrop-blur-sm dark:border-white/20"
            style={{
              width: size === 'sm' ? 22 : size === 'md' ? 26 : 30,
              height: size === 'sm' ? 22 : size === 'md' ? 26 : 30,
            }}
          >
            <span
              className={`font-bold text-main-text ${size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[10px]' : 'text-xs'}`}
            >
              +{card.additionalContentNames.length}
            </span>
          </div>
        )}

      <div className="absolute inset-0 overflow-hidden rounded-[1rem]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 40%)',
          }}
        />

        {!imageFailed ? (
          <Image
            src={imageSrc}
            alt={altText}
            fill
            sizes={`${width}px`}
            className="object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center px-3 text-center">
            <span className="line-clamp-2 text-xs font-bold text-white/70">
              {card.spotName}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `radial-gradient(ellipse at 50% 110%, ${accentColor} 0%, transparent 65%)`,
          }}
        />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2 pb-1.5 pt-8">
          <div
            className="mb-1 inline-flex items-center rounded-full px-1.5 py-0.5"
            style={{ backgroundColor: `${accentColor}33` }}
          >
            <span
              className="text-[9px] font-semibold uppercase tracking-wide"
              style={{ color: accentColor }}
            >
              {CATEGORY_LABEL[card.category]}
            </span>
          </div>
          <p
            className={`truncate font-medium text-white/95 ${TEXT_SIZE_CONFIG[size]}`}
          >
            {card.contentName}
          </p>
        </div>

        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ backgroundColor: accentColor }}
        />
      </div>
    </div>
  )
}
