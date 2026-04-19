'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'
import { CheckIn } from '@/types'
import { ContentGrid, ContentSummary } from './ContentGrid'
import { FeedGrid } from './FeedGrid'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'
import { useContentList as useContentListQuery } from '@/hooks/useGalleryQueries'

/**
 * ContentType 필터 칩 목록
 */
const CONTENT_TYPE_FILTERS = [
  { value: 'all', label: '전체' },
  { value: 'anime', label: '애니메이션' },
  { value: 'movie', label: '영화' },
  { value: 'drama', label: '드라마' },
  { value: 'sports_team', label: '스포츠팀' },
  { value: 'artist', label: '아티스트' },
  { value: 'game', label: '게임' },
  { value: 'other', label: '기타' },
] as const

/**
 * ContentTab 컴포넌트
 * 콘텐츠별 탭 - 콘텐츠 포스터 그리드와 필터링된 체크인 피드를 표시
 *
 * Requirements:
 * - 3.4: 콘텐츠별 탭에서 콘텐츠 포스터를 대형 카드로 그리드 레이아웃에 표시
 * - 3.5: 콘텐츠 선택 시 해당 콘텐츠 체크인만 필터링
 * - 8.3: React Query 전환
 */

export interface ContentTabProps {
  selectedContent?: string
  onCheckInClick?: (checkIn: CheckIn) => void
}

function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse rounded-xl bg-surface shadow-md">
          <div className="aspect-[3/4] rounded-t-xl bg-border" />
          <div className="p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-border" />
            <div className="h-3 w-1/2 rounded bg-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
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

function FilteredFeedHeader({
  contentName,
  onBack,
}: {
  contentName: string
  onBack: () => void
}) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 rounded-lg bg-surface px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-border"
        aria-label="콘텐츠 목록으로 돌아가기"
      >
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        <span>목록</span>
      </button>
      <h2 className="text-lg font-semibold text-primary-800">{contentName}</h2>
    </div>
  )
}

/**
 * 콘텐츠 검색바 (클라이언트 사이드 필터링)
 */
function ContentSearchBar({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="mb-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
          placeholder="콘텐츠 검색..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg bg-accent-surface py-2.5 pl-10 pr-10 text-sm text-main-text placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:placeholder-neutral-500"
          aria-label="콘텐츠 검색"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label="검색어 초기화"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * ContentType 필터 칩 바
 */
function ContentTypeFilterChips({
  activeFilter,
  onFilterChange,
}: {
  activeFilter: string
  onFilterChange: (value: string) => void
}) {
  return (
    <div className="scrollbar-hide mb-4 flex items-center gap-2 overflow-x-auto px-1 py-1">
      {CONTENT_TYPE_FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={`h-9 flex-shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            activeFilter === filter.value
              ? 'bg-primary text-white shadow-sm'
              : 'bg-accent-surface text-sub-text hover:bg-border'
          }`}
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export function ContentTab({
  selectedContent,
  onCheckInClick,
}: ContentTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // React Query로 콘텐츠 목록 조회 (필터 적용)
  const {
    data: contentData,
    isLoading: isLoadingContents,
    error: contentsError,
    refetch: refreshContents,
  } = useContentListQuery(activeFilter)

  // API 응답을 ContentSummary 형식으로 변환
  const contents: ContentSummary[] = (contentData?.items ?? []).map((item) => ({
    title: item.name,
    imageUrl: undefined,
    checkInCount: item.count,
    spotCount: 0,
    contentType: item.contentType,
  }))

  // 검색어로 클라이언트 사이드 필터링
  const filteredContents = searchQuery
    ? contents.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : contents

  // 필터링된 체크인 피드 (콘텐츠 선택 시에만 활성화)
  const {
    checkIns,
    isLoading: isLoadingCheckIns,
    isLoadingMore,
    error: checkInsError,
    hasMore,
    refresh: refreshCheckIns,
    loadMoreRef,
  } = useCheckInFeed({
    contentName: selectedContent,
    itemsPerPage: 21,
    sortBy: 'latest',
    enabled: !!selectedContent,
  })

  const handleSelectContent = useCallback(
    (contentName: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'content')
      params.set('content', contentName)
      router.push(`/gallery?${params.toString()}`)
    },
    [router, searchParams]
  )

  const handleBack = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'content')
    params.delete('content')
    router.push(`/gallery?${params.toString()}`)
  }, [router, searchParams])

  // 콘텐츠가 선택된 경우: FeedGrid로 필터링된 체크인 피드 표시
  if (selectedContent) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <FilteredFeedHeader contentName={selectedContent} onBack={handleBack} />
        <FeedGrid
          checkIns={checkIns}
          isLoading={isLoadingCheckIns}
          isLoadingMore={isLoadingMore}
          error={checkInsError ? new Error(checkInsError) : null}
          hasMore={hasMore}
          onRetry={refreshCheckIns}
          loadMoreRef={loadMoreRef as React.RefObject<HTMLDivElement>}
          onCheckInClick={onCheckInClick}
          emptyMessage={`'${selectedContent}' 관련 인증샷이 없어요`}
          emptySubMessage="첫 번째 순례 인증샷을 올려보세요!"
        />
      </div>
    )
  }

  // 콘텐츠가 선택되지 않은 경우: 콘텐츠 목록 그리드 표시
  if (contentsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ContentSearchBar value={searchQuery} onChange={setSearchQuery} />
        <ContentTypeFilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <ErrorState onRetry={() => refreshContents()} />
      </div>
    )
  }

  if (isLoadingContents) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ContentSearchBar value={searchQuery} onChange={setSearchQuery} />
        <ContentTypeFilterChips
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        <ContentGridSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ContentSearchBar value={searchQuery} onChange={setSearchQuery} />
      <ContentTypeFilterChips
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />
      <ContentGrid
        contents={filteredContents}
        onSelectContent={handleSelectContent}
      />
    </div>
  )
}

export default ContentTab
