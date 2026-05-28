'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CATEGORY_CONFIG, type SpotCategory } from '@/types/spot'
import { getSafeImageSrc } from '@/lib/safe-image-src'

/**
 * 소셜 프루프 카드 컴포넌트
 * 카테고리 태그, 스팟 이름, 코멘트, 스팟 사진 + 작품 속 장면 이미지를 표시
 * sceneImage가 있으면 좌우 분할 레이아웃, 없으면 단일 이미지
 * Requirements: 3.5, 3.6, 5.6, 5.7, 5.8
 */

interface ProofCardProps {
  categoryTag: SpotCategory
  spotName: string
  /** 작품명 (체크인 데이터에서 전달) */
  contentName?: string
  comment: string
  image?: string
  sceneImage?: string
}

export function ProofCard({
  categoryTag,
  spotName,
  contentName,
  comment,
  image,
  sceneImage,
}: ProofCardProps) {
  const [imageError, setImageError] = useState(false)
  const [sceneError, setSceneError] = useState(false)
  const categoryConfig = CATEGORY_CONFIG[categoryTag]
  const safeImage = image ? getSafeImageSrc(image) : undefined
  const safeSceneImage = sceneImage ? getSafeImageSrc(sceneImage) : undefined
  const hasScene = safeSceneImage && !sceneError

  return (
    <article className="flex w-64 shrink-0 flex-col overflow-hidden rounded-[1.35rem] border border-border bg-surface shadow-lg shadow-primary-500/5 dark:border-white/10 md:w-72">
      {/* 이미지 영역 */}
      <div className="relative h-40 w-full bg-accent-surface">
        {hasScene ? (
          /* 좌우 분할: 스팟 사진 | 작품 장면 */
          <div className="flex h-full">
            {/* 스팟 실제 사진 */}
            <div className="relative h-full w-1/2 overflow-hidden">
              {safeImage && !imageError ? (
                <Image
                  src={safeImage}
                  alt={`${spotName} 실제 사진`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 144px"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageFallback />
              )}
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                실제
              </span>
            </div>
            {/* 구분선 */}
            <div className="z-10 w-px bg-border" />
            {/* 작품 속 장면 */}
            <div className="relative h-full w-1/2 overflow-hidden">
              <Image
                src={safeSceneImage}
                alt={`${spotName} 작품 속 장면`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 128px, 144px"
                onError={() => setSceneError(true)}
              />
              <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                작품
              </span>
            </div>
          </div>
        ) : safeImage && !imageError ? (
          /* 단일 이미지 (기존 레이아웃) */
          <Image
            src={safeImage}
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
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        {/* 카테고리 태그 */}
        <span
          className="w-fit rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            backgroundColor: categoryConfig.bgColor,
            color: categoryConfig.fgColor,
          }}
        >
          {categoryConfig.label}
        </span>

        {/* 스팟 이름 + 작품명 */}
        <h3 className="text-sm font-semibold leading-snug tracking-[-0.01em] text-main-text">
          {spotName}
          {contentName && (
            <span
              className={`ml-1 text-xs font-normal ${
                contentName === '(미분류)' ? 'text-gray-400' : 'text-sub-text'
              }`}
            >
              · {contentName}
            </span>
          )}
        </h3>

        {/* 코멘트 */}
        <p className="line-clamp-2 text-xs leading-relaxed text-sub-text">
          {comment}
        </p>
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
