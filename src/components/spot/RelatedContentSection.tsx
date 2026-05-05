'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  RelatedContent,
  ContentType,
  SpotContentRelation,
  RELATION_TYPE_LABELS,
} from '@/types'
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
  relations: SpotContentRelation[] // 새 필드 (우선)
  contents?: RelatedContent[] // 폴백용 (과도기)
  initialDisplayCount?: number // 기본값: 3
}

/**
 * 스팟 상세 페이지에서 관련 콘텐츠를 표시하는 섹션 컴포넌트
 *
 * Requirements:
 * - 8.1: 대표 관계 최대 3개를 상단에 카드 형태로 먼저 표시
 * - 8.2: 4개 이상일 때 "더보기 (+N)" 버튼 제공
 * - 8.3: 각 관계 카드에 작품명, 작품 타입, 관계 유형 라벨 표시
 * - 8.4: summary 정보가 있으면 카드에 표시
 * - 8.5: 관계 유형별 한글 라벨 표시
 * - 8.6: 관계 목록이 비어있으면 섹션 숨김
 * - 8.7: 각 관계 카드에 "작품별 스팟 보기" 링크 포함
 */
export function RelatedContentSection({
  relations,
  contents,
  initialDisplayCount = 3,
}: RelatedContentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // relations가 있으면 relation 기반 렌더링
  if (relations && relations.length > 0) {
    // displayPriority 오름차순 정렬 강화 (Requirements 10.4)
    const sortedRelations = [...relations].sort(
      (a, b) => a.displayPriority - b.displayPriority
    )
    const hasMore = sortedRelations.length > initialDisplayCount
    const displayedRelations = isExpanded
      ? sortedRelations
      : sortedRelations.slice(0, initialDisplayCount)
    const remainingCount = sortedRelations.length - initialDisplayCount

    return (
      <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-main-text">
            관련 콘텐츠
          </h2>

          {/* 관계 카드 그리드 (Requirements 8.1) */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {displayedRelations.map((relation) => (
              <RelationCard key={relation.id} relation={relation} />
            ))}
          </div>

          {/* 더보기/접기 버튼 (Requirements 8.2) */}
          {hasMore && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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

  // relations 비어있고 contents도 비어있으면 섹션 숨김 (Requirements 8.6)
  if (!contents || contents.length === 0) {
    return null
  }

  // relations 비어있지만 contents 있으면 기존 렌더링으로 폴백
  const hasMoreContents = contents.length > initialDisplayCount
  const displayedContents = isExpanded
    ? contents
    : contents.slice(0, initialDisplayCount)
  const remainingCount = contents.length - initialDisplayCount

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-md">
      <div className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-main-text">관련 콘텐츠</h2>

        {/* 콘텐츠 그리드 (폴백) */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {displayedContents.map((content, index) => (
            <RelatedContentCard key={index} content={content} />
          ))}
        </div>

        {/* 더보기/접기 버튼 (폴백) */}
        {hasMoreContents && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
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

interface RelationCardProps {
  relation: SpotContentRelation
}

/**
 * 관계 기반 카드 컴포넌트
 * Requirements 8.3: 작품명, 작품 타입, 관계 유형 라벨 표시
 * Requirements 8.4: summary 표시
 * Requirements 8.5: 관계 유형별 한글 라벨
 * Requirements 8.7: 작품별 스팟 보기 링크
 */
function RelationCard({ relation }: RelationCardProps) {
  const typeLabel =
    CONTENT_TYPE_LABELS[relation.contentType] || CONTENT_TYPE_LABELS.other
  const relationLabel =
    RELATION_TYPE_LABELS[relation.relationType] || relation.relationType

  return (
    <div className="rounded-lg border border-border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 대표 이미지가 있으면 원형 뱃지로 표시, 없으면 기본 아이콘 */}
          {relation.contentImageUrl ? (
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-border">
              <Image
                src={relation.contentImageUrl}
                alt={relation.contentName}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <ContentTypeIcon type={relation.contentType} size="3xl" />
          )}
          <h3 className="font-semibold text-main-text">
            {relation.contentName}
          </h3>
        </div>
        <span className="rounded-full bg-accent-surface px-2 py-0.5 text-xs text-sub-text">
          {typeLabel}
        </span>
      </div>

      {/* 관계 유형 라벨 (Requirements 8.5) */}
      <div className="mt-2">
        <span className="inline-block rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          {relationLabel}
        </span>
      </div>

      {/* summary 표시 (Requirements 8.4) */}
      {relation.summary && (
        <p className="mt-1 text-sm text-sub-text">{relation.summary}</p>
      )}

      {/* 작품별 스팟 보기 링크 (Requirements 8.7) */}
      <Link
        href={`/contents/${encodeURIComponent(relation.contentName)}`}
        className="mt-3 inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary-700"
      >
        <span>작품별 스팟 보기</span>
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

interface RelatedContentCardProps {
  content: RelatedContent
}

/**
 * 개별 관련 콘텐츠 카드 컴포넌트 (폴백용)
 * Requirements 3.4: 타입 아이콘, 이름, 연도, 추가정보 표시
 */
function RelatedContentCard({ content }: RelatedContentCardProps) {
  const typeLabel =
    CONTENT_TYPE_LABELS[content.type] || CONTENT_TYPE_LABELS.other

  return (
    <div className="rounded-lg border border-border p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* 대표 이미지가 있으면 원형 뱃지로 표시, 없으면 기본 아이콘 */}
          {content.imageUrl ? (
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-border">
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
          <h3 className="font-semibold text-main-text">{content.name}</h3>
        </div>
        <span className="rounded-full bg-accent-surface px-2 py-0.5 text-xs text-sub-text">
          {typeLabel}
        </span>
      </div>
      {(content.year || content.additionalInfo) && (
        <p className="mt-1 text-sm text-sub-text">
          {content.year && `${content.year}년`}
          {content.year && content.additionalInfo && ' · '}
          {content.additionalInfo}
        </p>
      )}
      <Link
        href={`/contents/${encodeURIComponent(content.name)}`}
        className="mt-3 inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary-700"
      >
        <span>작품별 스팟 보기</span>
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
