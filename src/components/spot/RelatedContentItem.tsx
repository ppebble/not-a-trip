'use client'

import Image from 'next/image'
import { RelatedContent, ContentType } from '@/types'
import { ContentTypeIcon } from '@/components/common'

// 콘텐츠 타입 라벨 설정
const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  anime: '애니메이션',
  movie: '영화',
  drama: '드라마',
  sports_team: '스포츠 팀',
  artist: '아티스트',
  game: '게임',
  other: '기타',
}

interface RelatedContentItemProps {
  content: RelatedContent
  index: number
  onRemove: () => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDragEnd: () => void
  isDragging: boolean
  isDragOver: boolean
}

/**
 * 개별 관련 콘텐츠 항목 컴포넌트
 * 드래그 앤 드롭을 지원하며 삭제 기능을 제공합니다.
 *
 * Requirements:
 * - 1.3: 추가된 콘텐츠 목록에서 특정 항목 삭제
 * - 2.3: 각 콘텐츠 항목에 순서 변경을 위한 드래그 핸들 표시
 * - 3.4: 각 콘텐츠의 타입 아이콘, 이름, 연도, 추가정보 표시
 */
export function RelatedContentItem({
  content,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDragOver,
}: RelatedContentItemProps) {
  const typeLabel =
    CONTENT_TYPE_LABELS[content.type] || CONTENT_TYPE_LABELS.other

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(index)
      }}
      onDragEnd={onDragEnd}
      className={`flex items-center justify-between rounded-lg border bg-white p-3 transition-all ${isDragging ? 'border-navy-400 opacity-50 shadow-lg' : 'border-navy-200'} ${isDragOver ? 'border-2 border-navy-500 bg-navy-50' : ''} `}
    >
      {/* 드래그 핸들 */}
      <div
        className="mr-2 cursor-grab text-navy-400 hover:text-navy-600 active:cursor-grabbing"
        aria-label="드래그하여 순서 변경"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8h16M4 16h16"
          />
        </svg>
      </div>

      {/* 콘텐츠 정보 */}
      <div className="flex flex-1 items-center gap-3">
        {/* 대표 이미지가 있으면 원형 뱃지로 표시, 없으면 기본 아이콘 */}
        {content.imageUrl ? (
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border-2 border-navy-200">
            <Image
              src={content.imageUrl}
              alt={content.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        ) : (
          <ContentTypeIcon type={content.type} size="lg" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-navy-800">{content.name}</p>
          <p className="truncate text-xs text-navy-500">
            {typeLabel}
            {content.year && ` · ${content.year}년`}
            {content.additionalInfo && ` · ${content.additionalInfo}`}
          </p>
        </div>
      </div>

      {/* 삭제 버튼 */}
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 rounded p-1 text-navy-400 transition-colors hover:bg-red-50 hover:text-red-500"
        aria-label={`${content.name} 삭제`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}
