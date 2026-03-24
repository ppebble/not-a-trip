'use client'

import { useState } from 'react'
import Link from 'next/link'
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

interface RelatedContentSectionProps {
  contents: RelatedContent[]
  initialDisplayCount?: number // 기본값: 3
}

/**
 * 스팟 상세 페이지에서 관련 콘텐츠를 표시하는 섹션 컴포넌트
 *
 * Requirements:
 * - 3.1: 모든 관련 콘텐츠를 그리드 형태로 표시
 * - 3.2: 4개 이상일 때 처음 3개만 표시하고 "더보기" 버튼 제공
 * - 3.3: "더보기" 클릭 시 나머지 모든 콘텐츠 표시
 * - 6.2: 빈 배열일 때 섹션 숨김
 */
export function RelatedContentSection({
  contents,
  initialDisplayCount = 3,
}: RelatedContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // 빈 배열일 때 섹션 숨김 (Requirements 6.2)
  if (!contents || contents.length === 0) {
    return null
  }

  const hasMoreContents = contents.length > initialDisplayCount
  const displayedContents = isExpanded
    ? contents
    : contents.slice(0, initialDisplayCount)
  const remainingCount = contents.length - initialDisplayCount

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">관련 콘텐츠</h2>

        {/* 콘텐츠 그리드 (Requirements 3.1) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayedContents.map((content, index) => (
            <RelatedContentCard key={index} content={content} />
          ))}
        </div>

        {/* 더보기/접기 버튼 (Requirements 3.2, 3.3) */}
        {hasMoreContents && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-navy-300 text-navy-600 hover:bg-navy-50 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>접기</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span>더보기 (+{remainingCount})</span>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface RelatedContentCardProps {
  content: RelatedContent
}

/**
 * 개별 관련 콘텐츠 카드 컴포넌트
 * Requirements 3.4: 타입 아이콘, 이름, 연도, 추가정보 표시
 */
function RelatedContentCard({ content }: RelatedContentCardProps) {
  const typeLabel =
    CONTENT_TYPE_LABELS[content.type] || CONTENT_TYPE_LABELS.other

  return (
    <div className="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 대표 이미지가 있으면 원형 뱃지로 표시, 없으면 기본 아이콘 */}
          {content.imageUrl ? (
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-gray-200">
              <Image
                src={content.imageUrl}
                alt={content.name}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <ContentTypeIcon type={content.type} size="3xl" />
          )}
          <h3 className="font-semibold text-gray-900">{content.name}</h3>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
          {typeLabel}
        </span>
      </div>
      {(content.year || content.additionalInfo) && (
        <p className="mt-1 text-sm text-gray-600">
          {content.year && `${content.year}년`}
          {content.year && content.additionalInfo && ' · '}
          {content.additionalInfo}
        </p>
      )}
      <Link
        href={`/community/media/${encodeURIComponent(content.name)}`}
        className="text-navy-600 hover:text-navy-800 mt-3 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <span>커뮤니티 보기</span>
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  )
}
