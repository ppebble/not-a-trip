'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 카드 컴포넌트
 * 카테고리 태그, 스팟 이름, 코멘트, 이미지를 표시
 * Requirements: 3.5, 3.6
 */

interface ProofCardProps {
  categoryTag: SpotCategory
  spotName: string
  comment: string
  image?: string
}

export function ProofCard({
  categoryTag,
  spotName,
  comment,
  image,
}: ProofCardProps) {
  const [imageError, setImageError] = useState(false)
  const categoryConfig = CATEGORY_CONFIG[categoryTag]

  return (
    <article className="flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface md:w-72">
      {/* 이미지 영역 */}
      <div className="relative h-36 w-full bg-accent-surface">
        {image && !imageError ? (
          <Image
            src={image}
            alt={`${spotName} 성지순례 인증`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 256px, 288px"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl" role="img" aria-label="성지순례 인증">
              📍
            </span>
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        {/* 카테고리 태그 */}
        <span
          className="w-fit rounded-sm px-2 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: categoryConfig.bgColor,
            color: categoryConfig.fgColor,
          }}
        >
          {categoryConfig.label}
        </span>

        {/* 스팟 이름 */}
        <h3 className="text-sm font-semibold text-main-text">{spotName}</h3>

        {/* 코멘트 */}
        <p className="line-clamp-2 text-xs text-sub-text">{comment}</p>
      </div>
    </article>
  )
}
