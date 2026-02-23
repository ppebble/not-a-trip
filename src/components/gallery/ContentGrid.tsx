'use client'

import { useState } from 'react'
import Image from 'next/image'

/**
 * 작품 요약 정보 인터페이스
 */
export interface ContentSummary {
  title: string
  imageUrl?: string
  checkInCount: number
  spotCount: number
}

export interface ContentGridProps {
  contents: ContentSummary[]
  onSelectContent: (contentName: string) => void
}

/**
 * ContentGrid 컴포넌트
 * 작품별 탭에서 작품 포스터를 그리드 레이아웃으로 표시합니다.
 *
 * Requirements: 3.4
 * - 작품 포스터를 대형 카드로 그리드 레이아웃에 표시
 * - 반응형: 모바일 2열, 태블릿 3열, 데스크톱 4열
 */
export function ContentGrid({ contents, onSelectContent }: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <span className="mb-2 text-4xl">📚</span>
        <p>등록된 작품이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {contents.map((content) => (
        <ContentCard
          key={content.title}
          content={content}
          onClick={() => onSelectContent(content.title)}
        />
      ))}
    </div>
  )
}

interface ContentCardProps {
  content: ContentSummary
  onClick: () => void
}

/**
 * ContentCard 컴포넌트
 * 개별 작품 포스터 카드
 */
function ContentCard({ content, onClick }: ContentCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      aria-label={`${content.title} 작품 보기`}
    >
      {/* 포스터 이미지 영역 */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100">
        {content.imageUrl && !imageError ? (
          <Image
            src={content.imageUrl}
            alt={`${content.title} 포스터`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <span className="text-5xl">🎬</span>
          </div>
        )}

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* 작품 정보 영역 */}
      <div className="flex flex-1 flex-col p-3">
        {/* 작품 제목 */}
        <h3 className="mb-2 line-clamp-2 text-left text-sm font-semibold text-gray-900">
          {content.title}
        </h3>

        {/* 통계 정보 */}
        <div className="mt-auto flex items-center gap-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span>📍</span>
            <span>{content.spotCount}개 스팟</span>
          </span>
          <span className="flex items-center gap-1">
            <span>📸</span>
            <span>{content.checkInCount}회 인증</span>
          </span>
        </div>
      </div>
    </button>
  )
}

export default ContentGrid
