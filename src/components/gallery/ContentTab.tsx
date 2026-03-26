'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { CheckIn } from '@/types'
import { ContentGrid, ContentSummary } from './ContentGrid'
import { MasonryGrid, MasonryItem } from './MasonryGrid'
import { ComparisonCard } from './ComparisonCard'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'
import { useContentList as useContentListQuery } from '@/hooks/useGalleryQueries'

/**
 * ContentTab 컴포넌트
 * 작품별 탭 - 작품 포스터 그리드와 필터링된 체크인 피드를 표시
 *
 * Requirements:
 * - 3.4: 작품별 탭에서 작품 포스터를 대형 카드로 그리드 레이아웃에 표시
 * - 3.5: 작품 선택 시 해당 작품 체크인만 필터링
 * - 8.3: React Query 전환
 */

export interface ContentTabProps {
  selectedContent?: string
  onCheckInClick?: (checkIn: CheckIn) => void
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <MasonryItem key={`skeleton-${i}`}>
          <div className="animate-pulse rounded-xl bg-white shadow-md">
            <div className="aspect-[4/5] rounded-t-xl bg-border" />
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-border" />
                <div className="h-4 w-20 rounded bg-border" />
              </div>
              <div className="h-4 w-32 rounded bg-surface" />
            </div>
          </div>
        </MasonryItem>
      ))}
    </>
  )
}

function EmptyFilteredState({ contentName }: { contentName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📸</div>
      <p className="text-text-secondary text-lg font-medium">
        &apos;{contentName}&apos; 관련 인증샷이 없어요
      </p>
      <p className="mt-2 text-sm text-secondary">
        첫 번째 순례 인증샷을 올려보세요!
      </p>
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

function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white shadow-md">
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
        aria-label="작품 목록으로 돌아가기"
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

export function ContentTab({
  selectedContent,
  onCheckInClick,
}: ContentTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // React Query로 작품 목록 조회
  const {
    data: contentData,
    isLoading: isLoadingContents,
    error: contentsError,
    refetch: refreshContents,
  } = useContentListQuery()

  // API 응답을 ContentSummary 형식으로 변환
  const contents: ContentSummary[] = (contentData?.items ?? []).map((item) => ({
    title: item.name,
    imageUrl: undefined,
    checkInCount: item.count,
    spotCount: 0,
  }))

  // 필터링된 체크인 피드 (작품 선택 시에만 활성화)
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
    itemsPerPage: 20,
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

  // 작품이 선택된 경우: 필터링된 체크인 피드 표시
  if (selectedContent) {
    if (checkInsError && checkIns.length === 0) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <FilteredFeedHeader
            contentName={selectedContent}
            onBack={handleBack}
          />
          <ErrorState onRetry={refreshCheckIns} />
        </div>
      )
    }

    if (!isLoadingCheckIns && checkIns.length === 0) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-6">
          <FilteredFeedHeader
            contentName={selectedContent}
            onBack={handleBack}
          />
          <EmptyFilteredState contentName={selectedContent} />
        </div>
      )
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <FilteredFeedHeader contentName={selectedContent} onBack={handleBack} />
        <MasonryGrid>
          {checkIns.map((checkIn) => (
            <MasonryItem key={checkIn.id}>
              <ComparisonCard
                checkIn={checkIn}
                spot={
                  checkIn.spot || {
                    id: checkIn.spotId,
                    name: '알 수 없는 스팟',
                  }
                }
                badges={checkIn.badges}
                onClick={() => onCheckInClick?.(checkIn)}
              />
            </MasonryItem>
          ))}
          {isLoadingCheckIns && <LoadingSkeleton />}
        </MasonryGrid>
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
    )
  }

  // 작품이 선택되지 않은 경우: 작품 목록 그리드 표시
  if (contentsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ErrorState onRetry={() => refreshContents()} />
      </div>
    )
  }

  if (isLoadingContents) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ContentGridSkeleton />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <ContentGrid contents={contents} onSelectContent={handleSelectContent} />
    </div>
  )
}

export default ContentTab
