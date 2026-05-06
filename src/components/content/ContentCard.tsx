'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CONTENT_TYPE_CONFIG } from '@/types'
import type { ContentListItem } from './ContentListClient'

interface ContentCardProps {
  content: ContentListItem
}

/**
 * 작품 카드 컴포넌트
 * Requirements: 2.3, 2.4
 * - 작품명, 타입 라벨, 스팟 수, 대표 이미지 표시
 * - 카드 클릭 시 /contents/{encodeURIComponent(contentName)} 이동
 * - 이미지 로드 실패 시 플레이스홀더 아이콘 표시
 * - 접근성: alt 텍스트, 키보드 네비게이션 (Link 컴포넌트)
 */
export function ContentCard({ content }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)
  const typeConfig = CONTENT_TYPE_CONFIG[content.contentType]

  return (
    <Link
      href={`/contents/${encodeURIComponent(content.contentName)}`}
      className="group block overflow-hidden rounded-lg border border-border bg-background transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      {/* 이미지 영역 */}
      <div className="relative aspect-[4/3] w-full bg-border/30">
        {content.imageUrl && !imageError ? (
          <Image
            src={content.imageUrl}
            alt={`${content.contentName} 대표 이미지`}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Image
              src={typeConfig.icon}
              alt={typeConfig.label}
              width={48}
              height={48}
              className="opacity-40"
            />
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <p className="truncate text-sm font-medium text-main-text group-hover:text-primary">
          {content.contentName}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-medium"
            style={{
              backgroundColor: typeConfig.bgColor,
              color: typeConfig.fgColor,
            }}
          >
            {typeConfig.label}
          </span>
          <span className="text-xs text-sub-text">
            스팟 {content.spotCount}개
          </span>
        </div>
      </div>
    </Link>
  )
}
