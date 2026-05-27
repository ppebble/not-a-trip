'use client'

import Image from 'next/image'
import { useState } from 'react'

import { getSafeImageSrc } from '@/lib/safe-image-src'
import type { SpotCategory } from '@/types/spot'
import type { ShowcaseCard } from './data/showcaseCards'
import { getCategoryAccentColor } from './data/showcaseCards'

/**
 * FloatingCard 컴포넌트
 * 히어로 섹션 플로팅 카드 콜라주의 개별 카드
 * - 카테고리별 그라데이션 배경 + 아이콘을 기본으로 표시
 * - 실제 이미지가 있으면 이미지로 오버레이
 * - 다크 테마 스타일: 반투명 배경, 미세한 글로우, 둥근 모서리
 * - 데스크톱 호버: scale(1.05) + 그림자 강화
 * - 3가지 크기 variant: sm(120×90), md(160×120), lg(200×150)
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

/** 크기별 아이콘 크기 */
const ICON_SIZE_CONFIG = {
  sm: 32,
  md: 40,
  lg: 52,
} as const

/** 카테고리 한글 레이블 (태그용 짧은 버전) */
const CATEGORY_LABEL: Record<SpotCategory, string> = {
  animation: '애니',
  sports: '스포츠',
  movie_drama: '영화',
  music: '음악',
  game: '게임',
  other: '기타',
}

/**
 * 카테고리별 그라데이션 배경
 * 이미지가 없어도 시각적으로 풍부하게 보이도록 기본 배경으로 사용
 */
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
  // 이미지가 실제로 유효한지 (1px placeholder 제외)
  const [imageValid, setImageValid] = useState(false)
  const [iconError, setIconError] = useState(false)

  const { width, height } = SIZE_CONFIG[size]
  const accentColor = getCategoryAccentColor(card.category)
  const iconSrc = `/icons/categories/${card.category}.webp`
  const imageSrc = getSafeImageSrc(card.imageUrl)
  const altText = `${card.spotName} - ${card.contentName}`
  const iconSize = ICON_SIZE_CONFIG[size]

  return (
    <div
      className="group relative rounded-lg border border-white/10 shadow-lg backdrop-blur-sm transition-all duration-300 will-change-transform hover:scale-105 hover:shadow-2xl hover:shadow-white/10"
      style={{
        width,
        height,
        background: CATEGORY_GRADIENT[card.category],
      }}
      data-index={index}
      data-reduced-motion={reducedMotion}
    >
      {/* "+N" 배지 — 다중 작품 스팟에서만 표시 (Requirements 9.1, 9.2, 9.5) */}
      {card.additionalContentNames &&
        card.additionalContentNames.length > 0 && (
          <div
            className="absolute -right-1 -top-1 z-20 flex items-center justify-center rounded-full border border-white/20 bg-white/90 shadow-md backdrop-blur-sm"
            style={{
              width: size === 'sm' ? 22 : size === 'md' ? 26 : 30,
              height: size === 'sm' ? 22 : size === 'md' ? 26 : 30,
            }}
          >
            <span
              className={`font-bold text-gray-800 ${size === 'sm' ? 'text-[9px]' : size === 'md' ? 'text-[10px]' : 'text-xs'}`}
            >
              +{card.additionalContentNames.length}
            </span>
          </div>
        )}

      {/* 카드 내부 콘텐츠 (overflow-hidden 적용) */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        {/* 배경 하이라이트 효과 */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 0%, transparent 40%)',
          }}
        />

        {/* 카테고리 아이콘 (이미지 없을 때 중앙 표시) */}
        {!imageValid && (
          <div className="absolute inset-0 flex items-center justify-center">
            {!iconError ? (
              <Image
                src={iconSrc}
                alt={card.category}
                width={iconSize}
                height={iconSize}
                className="opacity-50 drop-shadow-lg"
                onError={() => setIconError(true)}
              />
            ) : (
              <div
                className="rounded-full opacity-40"
                style={{
                  width: iconSize,
                  height: iconSize,
                  backgroundColor: accentColor,
                }}
              />
            )}
          </div>
        )}

        {/* accent 글로우 (하단) */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background: `radial-gradient(ellipse at 50% 110%, ${accentColor} 0%, transparent 65%)`,
          }}
        />

        {/* 실제 이미지 (유효한 경우에만 표시) */}
        <Image
          src={imageSrc}
          alt={altText}
          fill
          sizes={`${width}px`}
          className={`object-cover transition-opacity duration-300 ${imageValid ? 'opacity-100' : 'opacity-0'}`}
          onLoad={(e) => {
            // 1px placeholder 이미지 감지: naturalWidth/naturalHeight가 1이면 무시
            const img = e.currentTarget
            if (img.naturalWidth > 1 && img.naturalHeight > 1) {
              setImageValid(true)
            }
          }}
          onError={() => setImageValid(false)}
        />

        {/* 작품명 오버레이 */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-6">
          {/* 카테고리 태그 */}
          <div
            className="mb-1 inline-flex items-center rounded px-1.5 py-0.5"
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
            className={`truncate font-medium text-white/90 ${TEXT_SIZE_CONFIG[size]}`}
          >
            {card.contentName}
          </p>
        </div>

        {/* 카테고리 accent 하단 바 */}
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ backgroundColor: accentColor }}
        />
      </div>
      {/* 카드 내부 콘텐츠 wrapper 닫기 */}
    </div>
  )
}
