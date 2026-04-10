'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { SpotCategory } from '@/types/spot'

/**
 * 카테고리 카드 컴포넌트
 * 스토리텔링 섹션에서 각 카테고리를 소개하는 카드
 * Requirements: 2.4, 2.5, 2.6, 2.7, 2.8
 */

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

/**
 * 카테고리별 CSS 변수 기반 인라인 스타일 생성
 * Tailwind의 arbitrary value로는 CSS 변수 동적 참조가 어려워 인라인 스타일 사용
 */
function getCategoryStyles(colorToken: string) {
  return {
    backgroundColor: `rgb(var(--${colorToken}-bg) / 0.3)`,
    borderColor: `rgb(var(--${colorToken}-fg) / 0.3)`,
  }
}

function getCategoryAccentStyle(colorToken: string) {
  return {
    color: `rgb(var(--${colorToken}-fg))`,
  }
}

export function CategoryCard({
  category,
  title,
  description,
  mascotProp,
  spotImage,
  colorToken,
  index,
  isHighEnd,
  reducedMotion,
}: CategoryCardProps) {
  const [imageError, setImageError] = useState(false)

  const cardStyles = getCategoryStyles(colorToken)
  const accentStyles = getCategoryAccentStyle(colorToken)

  return (
    <article
      className={`category-card group relative flex flex-col overflow-hidden rounded-xl border backdrop-blur-sm transition-transform duration-300 ${
        !reducedMotion && isHighEnd ? 'hover:scale-[1.02]' : ''
      }`}
      style={{
        ...cardStyles,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
      }}
      data-index={index}
      data-category={category}
    >
      {/* 스팟 이미지 영역 */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {!imageError ? (
          <Image
            src={spotImage}
            alt={`${title} 대표 이미지`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ backgroundColor: `rgb(var(--${colorToken}-bg) / 0.6)` }}
          >
            <span className="text-lg font-semibold" style={accentStyles}>
              {title}
            </span>
          </div>
        )}
      </div>

      {/* 카드 콘텐츠 */}
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        {/* 마스코트 소품 + 제목 */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={mascotProp}
              alt={`${title} 카테고리 아이콘`}
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
          <h3 className="text-lg font-bold md:text-xl" style={accentStyles}>
            {title}
          </h3>
        </div>

        {/* 설명 */}
        <p className="text-sm leading-relaxed text-sub-text md:text-base">
          {description}
        </p>

        {/* 더 보기 링크 */}
        <Link
          href={`/map?category=${category}`}
          className="mt-auto inline-flex items-center gap-1 self-start text-sm font-medium transition-colors hover:underline"
          style={accentStyles}
        >
          더 보기
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
