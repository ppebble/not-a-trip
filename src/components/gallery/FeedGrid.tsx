'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckIn } from '@/types'

/**
 * FeedGrid 공통 컴포넌트
 * FeedTab과 ContentTab에서 공유하는 3열 정사각형 그리드
 *
 * - 3열 정사각형 그리드 (grid-cols-3 gap-0.5)
 * - FeedGridItem: aspect-square + object-cover + 호버 오버레이
 * - 로딩 스켈레톤, 빈 상태, 에러 상태 포함
 * - 무한 스크롤 트리거 영역
 */

export interface FeedGridProps {
  checkIns: (CheckIn & { spot?: { id: string; name: string } })[]
  isLoading: boolean
  isLoadingMore: boolean
  error: Error | null
  hasMore: boolean
  onRetry: () => void
  loadMoreRef: React.RefObject<HTMLDivElement>
  onCheckInClick?: (checkIn: CheckIn) => void
  emptyMessage?: string
  emptySubMessage?: string
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
function EmptyState({
  message,
  subMessage,
}: {
  message: string
  subMessage: string
}) {
  return (
    <div className="col-span-3 flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">📸</div>
      <p className="text-text-secondary text-lg font-medium">{message}</p>
      <p className="mt-2 text-sm text-secondary">{subMessage}</p>
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

export function FeedGrid({
  checkIns,
  isLoading,
  isLoadingMore,
  error,
  hasMore,
  onRetry,
  loadMoreRef,
  onCheckInClick,
  emptyMessage = '아직 인증샷이 없어요',
  emptySubMessage = '첫 번째 순례 인증샷을 올려보세요!',
}: FeedGridProps) {
  return (
    <>
      <div className="grid grid-cols-3 gap-0.5">
        {/* 에러 상태 */}
        {error && checkIns.length === 0 && <ErrorState onRetry={onRetry} />}

        {/* 빈 상태 */}
        {!isLoading && checkIns.length === 0 && !error && (
          <EmptyState message={emptyMessage} subMessage={emptySubMessage} />
        )}

        {/* 체크인 그리드 */}
        {checkIns.map((checkIn, index) => (
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
    </>
  )
}

export default FeedGrid
