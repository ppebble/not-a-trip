'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckIn } from '@/types'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'

/**
 * FeedTab 컴포넌트
 * 인스타그램 탐색 스타일의 3열 정사각형 그리드로 체크인 목록 표시
 *
 * Requirements:
 * - 3.2: 실시간 피드 탭에서 최신순 정렬된 체크인 표시
 * - 2.5: 무한 스크롤로 추가 체크인 로드
 * - 6.3: useCheckInFeed 훅을 통한 데이터 fetching 로직 통합
 */

export interface FeedTabProps {
  onCheckInClick?: (checkIn: CheckIn) => void
}

/** 검색바 컴포넌트 */
function SearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="sticky top-14 z-10 border-b border-border bg-surface px-4 py-3">
      <div className="mx-auto max-w-4xl">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="스팟 또는 유저 검색"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-lg bg-neutral-100 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:bg-accent-surface dark:text-neutral-200 dark:focus:ring-neutral-700"
          />
        </div>
      </div>
    </div>
  )
}

/** 로딩 스켈레톤 (3열 정사각형 그리드) */
function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={`skeleton-${i}`}
          className="aspect-square animate-pulse bg-border"
        />
      ))}
    </>
  )
}

/** 빈 상태 컴포넌트 */
function EmptyState() {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📸</div>
      <p className="text-text-secondary text-lg font-medium">
        아직 인증샷이 없어요
      </p>
      <p className="mt-2 text-sm text-secondary">
        첫 번째 순례 인증샷을 올려보세요!
      </p>
    </div>
  )
}

/** 에러 상태 컴포넌트 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">😢</div>
      <p className="text-text-secondary text-lg font-medium">
        데이터를 불러올 수 없습니다
      </p>
      <p className="mt-2 text-sm text-secondary">
        네트워크 연결을 확인해주세요
      </p>
      <button
        onClick={onRetry}
        className="mt-4 rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600"
      >
        다시 시도
      </button>
    </div>
  )
}

/** 그리드 아이템 (정사각형 + 호버 오버레이) */
function FeedGridItem({
  checkIn,
  spotName,
  isPriority,
  onClick,
}: {
  checkIn: CheckIn & { spot?: { id: string; name: string } }
  spotName: string
  isPriority: boolean
  onClick?: () => void
}) {
  const [imageError, setImageError] = useState(false)

  return (
    <button
      type="button"
      className="group relative aspect-square w-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-400"
      onClick={onClick}
      aria-label={`${checkIn.userName}님의 ${spotName} 인증샷`}
    >
      <Image
        src={imageError ? '/images/placeholder-spot.jpg' : checkIn.photoUrl}
        alt={`${checkIn.userName}의 인증샷`}
        fill
        className="object-cover"
        sizes="(max-width: 896px) 33vw, 299px"
        priority={isPriority}
        onError={() => setImageError(true)}
      />
      {/* 호버 오버레이 */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
        <div className="flex gap-4 text-sm font-semibold text-white">
          <span>❤️ {checkIn.likeCount ?? 0}</span>
        </div>
      </div>
    </button>
  )
}

export function FeedTab({ onCheckInClick }: FeedTabProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const {
    checkIns,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMoreRef,
  } = useCheckInFeed({
    itemsPerPage: 21, // 3의 배수로 그리드 정렬
    sortBy: 'latest',
  })

  // 검색 필터링 (클라이언트 사이드)
  const filtered = searchQuery
    ? checkIns.filter(
        (c) =>
          c.userName?.includes(searchQuery) ||
          c.spot?.name?.includes(searchQuery)
      )
    : checkIns

  return (
    <div>
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="mx-auto max-w-4xl px-0.5 py-2">
        <div className="grid grid-cols-3 gap-0.5">
          {/* 에러 상태 */}
          {error && filtered.length === 0 && <ErrorState onRetry={refresh} />}

          {/* 빈 상태 */}
          {!isLoading && filtered.length === 0 && !error && <EmptyState />}

          {/* 체크인 그리드 */}
          {filtered.map((checkIn, index) => (
            <FeedGridItem
              key={checkIn.id}
              checkIn={checkIn}
              spotName={checkIn.spot?.name ?? '알 수 없는 스팟'}
              isPriority={index < 6}
              onClick={() => onCheckInClick?.(checkIn)}
            />
          ))}

          {/* 초기 로딩 스켈레톤 */}
          {isLoading && <LoadingSkeleton />}
        </div>

        {/* 무한 스크롤 트리거 영역 */}
        <div
          ref={loadMoreRef}
          className="flex h-20 items-center justify-center"
          aria-hidden="true"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-secondary">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500" />
              <span className="text-sm">더 불러오는 중...</span>
            </div>
          )}
          {!hasMore && checkIns.length > 0 && (
            <p className="text-sm text-muted">모든 인증샷을 불러왔습니다</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FeedTab
