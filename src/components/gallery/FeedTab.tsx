'use client'

import { CheckIn } from '@/types'
import { MasonryGrid, MasonryItem } from './MasonryGrid'
import { ComparisonCard } from './ComparisonCard'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'

/**
 * FeedTab 컴포넌트
 * 실시간 피드 탭 - 최신순 정렬된 체크인 목록을 무한 스크롤로 표시
 *
 * Requirements:
 * - 3.2: 실시간 피드 탭에서 최신순 정렬된 체크인 표시
 * - 2.5: 무한 스크롤로 추가 체크인 로드
 * - 6.3: useCheckInFeed 훅을 통한 데이터 fetching 로직 통합
 */

export interface FeedTabProps {
  onCheckInClick?: (checkIn: CheckIn) => void
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <MasonryItem key={`skeleton-${i}`}>
          <div className="animate-pulse rounded-xl bg-white shadow-md">
            <div className="aspect-[4/5] rounded-t-xl bg-navy-200" />
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-navy-200" />
                <div className="h-4 w-20 rounded bg-navy-200" />
              </div>
              <div className="h-4 w-32 rounded bg-navy-100" />
            </div>
          </div>
        </MasonryItem>
      ))}
    </>
  )
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📸</div>
      <p className="text-lg font-medium text-navy-700">아직 인증샷이 없어요</p>
      <p className="mt-2 text-sm text-navy-500">
        첫 번째 순례 인증샷을 올려보세요!
      </p>
    </div>
  )
}

/**
 * 에러 상태 컴포넌트
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">😢</div>
      <p className="text-lg font-medium text-navy-700">
        데이터를 불러올 수 없습니다
      </p>
      <p className="mt-2 text-sm text-navy-500">네트워크 연결을 확인해주세요</p>
      <button
        onClick={onRetry}
        className="bg-primary-500 hover:bg-primary-600 mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}

export function FeedTab({ onCheckInClick }: FeedTabProps) {
  const {
    checkIns,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMoreRef,
  } = useCheckInFeed({
    itemsPerPage: 20,
    sortBy: 'latest',
  })

  // 에러 상태
  if (error && checkIns.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ErrorState onRetry={refresh} />
      </div>
    )
  }

  // 빈 상태
  if (!isLoading && checkIns.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <MasonryGrid>
        {/* 체크인 카드 목록 */}
        {checkIns.map((checkIn, index) => (
          <MasonryItem key={checkIn.id}>
            <ComparisonCard
              checkIn={checkIn}
              spot={
                checkIn.spot || { id: checkIn.spotId, name: '알 수 없는 스팟' }
              }
              badges={checkIn.badges}
              isPriority={index < 4}
              onClick={() => onCheckInClick?.(checkIn)}
            />
          </MasonryItem>
        ))}

        {/* 초기 로딩 스켈레톤 */}
        {isLoading && <LoadingSkeleton />}
      </MasonryGrid>

      {/* 무한 스크롤 트리거 영역 */}
      <div
        ref={loadMoreRef}
        className="flex h-20 items-center justify-center"
        aria-hidden="true"
      >
        {isLoadingMore && (
          <div className="flex items-center gap-2 text-navy-500">
            <div className="border-t-primary-500 h-5 w-5 animate-spin rounded-full border-2 border-navy-300" />
            <span className="text-sm">더 불러오는 중...</span>
          </div>
        )}
        {!hasMore && checkIns.length > 0 && (
          <p className="text-sm text-navy-400">모든 인증샷을 불러왔습니다</p>
        )}
      </div>
    </div>
  )
}

export default FeedTab
