'use client'

import { useState } from 'react'
import { CheckIn } from '@/types'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'
import { FeedGrid } from './FeedGrid'

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
        <FeedGrid
          checkIns={filtered}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          error={error ? new Error(error) : null}
          hasMore={hasMore}
          onRetry={refresh}
          loadMoreRef={loadMoreRef as React.RefObject<HTMLDivElement>}
          onCheckInClick={onCheckInClick}
        />
      </div>
    </div>
  )
}

export default FeedTab
