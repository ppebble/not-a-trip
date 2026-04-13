'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'

/**
 * 소셜 프루프 카드 컴포넌트
 * 카테고리 태그, 스팟 이름, 코멘트, 스팟 사진 + 작품 속 장면 이미지를 표시
 * sceneImage가 있으면 좌우 분할 레이아웃, 없으면 단일 이미지
 * Requirements: 3.5, 3.6, 5.6, 5.7, 5.8
 */

interface ProofCardProps {
  categoryTag: SpotCategory
  spotName: string
  comment: string
  image?: string
  sceneImage?: string
}

export function ProofCard({
  categoryTag,
  spotName,
  comment,
  image,
  sceneImage,
}: ProofCardProps) {
  const [imageError, setImageError] = useState(false)
  const [sceneError, setSceneError] = useState(false)
  const categoryConfig = CATEGORY_CONFIG[categoryTag]
  const hasScene = sceneImage && !sceneError

  return (
    <article className="flex w-64 shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-surface md:w-72">
      {/* 이미지 영역 */}
      <div className="relative h-36 w-full bg-accent-surface">
        {hasScene ? (
          /* 좌우 분할: 스팟 사진 | 작품 장면 */
          <div className="flex h-full">
            {/* 스팟 실제 사진 */}
            <div className="relative h-full w-1/2 overflow-hidden">
              {image && !imageError ? (
                <Image
                  src={image}
                  alt={`${spotName} 실제 사진`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 144px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageFallback />
              )}
              <span className="absolute bottom-1 left-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                실제
              </span>
            </div>
            {/* 구분선 */}
            <div className="z-10 w-px bg-border" />
            {/* 작품 속 장면 */}
            <div className="relative h-full w-1/2 overflow-hidden">
              <Image
                src={sceneImage}
                alt={`${spotName} 작품 속 장면`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 144px"
                onError={() => setSceneError(true)}
              />
              <span className="absolute bottom-1 right-1 rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                작품
              </span>
            </div>
          </div>
        ) : image && !imageError ? (
          /* 단일 이미지 (기존 레이아웃) */
          <Image
            src={image}
            alt={`${spotName} 성지순례 인증`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 256px, 288px"
            onError={() => setImageError(true)}
          />
        ) : (
          <ImageFallback />
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

/** 이미지 로드 실패 시 폴백 */
function ImageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="text-4xl" role="img" aria-label="성지순례 인증">
        📍
      </span>
    </div>
  )
}
