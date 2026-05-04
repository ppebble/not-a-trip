'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { ShowcaseCard } from './data/showcaseCards'
import { getCategoryAccentColor } from './data/showcaseCards'

/**
 * FloatingCard 컴포넌트
 * 히어로 섹션 플로팅 카드 콜라주의 개별 카드
 * - Next.js Image 컴포넌트로 이미지 최적화 (lazy loading, WebP)
 * - 카테고리별 accent 색상 하단 바 표시
 * - 다크 테마 스타일: 반투명 배경, 미세한 글로우, 둥근 모서리
 * - 데스크톱 호버: scale(1.05) + 그림자 강화
 * - 3가지 크기 variant: sm(120×90), md(160×120), lg(200×150)
 * - 이미지 로드 실패 시 카테고리 기본 아이콘 폴백
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 9.1, 9.3
 */

interface FloatingCardProps {
  /** 카드 데이터 */
  card: ShowcaseCard
  /** 카드 인덱스 (애니메이션 딜레이 계산용) */
  index: number
  /** 모션 감소 설정 */
  reducedMotion: boolean
  /** 카드 크기 variant */
  size: 'sm' | 'md' | 'lg'
}

/** 크기별 카드 치수 (width × height) */
const SIZE_CONFIG = {
  sm: { width: 120, height: 90 },
  md: { width: 160, height: 120 },
  lg: { width: 200, height: 150 },
} as const

/** 크기별 텍스트 스타일 */
const TEXT_SIZE_CONFIG = {
  sm: 'text-[10px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const

export function FloatingCard({
  card,
  index,
  reducedMotion,
  size,
}: FloatingCardProps) {
  const [imgError, setImgError] = useState(false)

  const { width, height } = SIZE_CONFIG[size]
  const accentColor = getCategoryAccentColor(card.category)
  const fallbackSrc = `/icons/categories/${card.category}.webp`
  const altText = `${card.spotName} - ${card.contentName}`

  return (
    <div
      className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/5 shadow-lg backdrop-blur-sm transition-all duration-300 will-change-transform hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
      style={{ width, height }}
      data-index={index}
      data-reduced-motion={reducedMotion}
    >
      {/* 이미지 영역 */}
      <div className="relative h-full w-full">
        <Image
          src={imgError ? fallbackSrc : card.imageUrl}
          alt={altText}
          fill
          sizes={`${width}px`}
          className="object-cover"
          onError={() => setImgError(true)}
        />
      </div>

      {/* 작품명 오버레이 */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
        <p
          className={`truncate font-medium text-white/90 ${TEXT_SIZE_CONFIG[size]}`}
        >
          {card.contentName}
        </p>
      </div>

      {/* 카테고리 accent 하단 바 */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  )
}
