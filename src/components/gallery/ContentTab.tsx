'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { CheckIn } from '@/types'
import { ContentGrid, ContentSummary } from './ContentGrid'
import { MasonryGrid, MasonryItem } from './MasonryGrid'
import { ComparisonCard } from './ComparisonCard'
import { useCheckInFeed } from '@/hooks/useCheckInFeed'

/**
 * ContentTab 컴포넌트
 * 작품별 탭 - 작품 포스터 그리드와 필터링된 체크인 피드를 표시
 *
 * Requirements:
 * - 3.4: 작품별 탭에서 작품 포스터를 대형 카드로 그리드 레이아웃에 표시
 * - 3.5: 작품 선택 시 해당 작품 체크인만 필터링
 */

export interface ContentTabProps {
  selectedContent?: string
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
 * 빈 상태 컴포넌트 (필터링된 결과가 없을 때)
 */
function EmptyFilteredState({ contentName }: { contentName: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📸</div>
      <p className="text-lg font-medium text-navy-700">
        &apos;{contentName}&apos; 관련 인증샷이 없어요
      </p>
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

/**
 * 콘텐츠 그리드 로딩 스켈레톤
 */
function ContentGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="animate-pulse rounded-xl bg-white shadow-md">
          <div className="aspect-[3/4] rounded-t-xl bg-navy-200" />
          <div className="p-3">
            <div className="mb-2 h-4 w-3/4 rounded bg-navy-200" />
            <div className="h-3 w-1/2 rounded bg-navy-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * 필터링된 피드 헤더 (뒤로가기 버튼 포함)
 */
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
        className="flex items-center gap-1 rounded-lg bg-navy-100 px-3 py-2 text-sm font-medium text-navy-600 transition-colors hover:bg-navy-200"
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
      <h2 className="text-lg font-semibold text-navy-800">{contentName}</h2>
    </div>
  )
}

/**
 * useContentList 훅 - 작품 목록 조회
 */
function useContentList() {
  const [contents, setContents] = useState<ContentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // content-names API에서 작품 목록 조회 (type=content로 작품명만)
      const res = await fetch('/api/content-names?type=content')
      if (!res.ok) {
        throw new Error('작품 목록 조회 실패')
      }

      const data = await res.json()

      // API 응답을 ContentSummary 형식으로 변환
      const contentSummaries: ContentSummary[] = data.items.map(
        (item: { name: string; count: number }) => ({
          title: item.name,
          imageUrl: undefined, // 이미지 URL은 별도 API 필요
          checkInCount: item.count,
          spotCount: 0, // 스팟 수는 별도 계산 필요
        })
      )

      setContents(contentSummaries)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContents()
  }, [fetchContents])

  return { contents, isLoading, error, refresh: fetchContents }
}

export function ContentTab({
  selectedContent,
  onCheckInClick,
}: ContentTabProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // 작품 목록 조회
  const {
    contents,
    isLoading: isLoadingContents,
    error: contentsError,
    refresh: refreshContents,
  } = useContentList()

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

  /**
   * 작품 선택 핸들러
   * URL 쿼리 파라미터로 선택된 작품 관리 (Requirements 3.5)
   */
  const handleSelectContent = useCallback(
    (contentName: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'content')
      params.set('content', contentName)
      router.push(`/gallery?${params.toString()}`)
    },
    [router, searchParams]
  )

  /**
   * 작품 목록으로 돌아가기
   */
  const handleBack = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', 'content')
    params.delete('content')
    router.push(`/gallery?${params.toString()}`)
  }, [router, searchParams])

  // 작품이 선택된 경우: 필터링된 체크인 피드 표시
  if (selectedContent) {
    // 에러 상태
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

    // 빈 상태
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

  // 작품이 선택되지 않은 경우: 작품 목록 그리드 표시
  // 에러 상태
  if (contentsError) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6">
        <ErrorState onRetry={refreshContents} />
      </div>
    )
  }

  // 로딩 상태
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
