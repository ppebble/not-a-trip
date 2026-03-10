'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useHallOfFameRanking } from '@/hooks/useGalleryQueries'
import { RankingList } from './RankingList'

export interface HallOfFameTabProps {
  onSpotClick?: (spotId: string) => void
  onCheckInClick?: (checkInId: string) => void
}

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const formatDate = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}`
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-center">
        <div className="h-6 w-48 animate-pulse rounded bg-navy-200" />
      </div>
      <div className="mb-8">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-navy-200" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-3"
            >
              <div className="h-10 w-10 animate-pulse rounded-full bg-navy-200" />
              <div className="h-14 w-14 animate-pulse rounded-lg bg-navy-200" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-navy-200" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-navy-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-navy-200" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl bg-white shadow-md"
            >
              <div className="aspect-square w-full rounded-t-xl bg-navy-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 명예의 전당 탭 컴포넌트
 * Requirements: 3.3, 8.3
 */
export function HallOfFameTab({
  onSpotClick,
  onCheckInClick,
}: HallOfFameTabProps) {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useHallOfFameRanking()

  const handleSpotClick = useCallback(
    (spotId: string) => {
      if (onSpotClick) {
        onSpotClick(spotId)
      } else {
        router.push(`/spots/${spotId}`)
      }
    },
    [onSpotClick, router]
  )

  if (isLoading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">😢</div>
          <p className="text-lg font-medium text-navy-700">
            데이터를 불러올 수 없습니다
          </p>
          <p className="mt-2 text-sm text-navy-500">
            잠시 후 다시 시도해주세요
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  const spotRanking = (data?.spotRanking ?? []).map((item) => ({
    spotId: item.spotId,
    spotName: item.spotName,
    spotThumbnail: item.thumbnailUrl,
    weeklyCheckIns: item.checkInCount,
  }))
  const checkInRanking = data?.checkInRanking ?? []
  const period = data?.period

  if (spotRanking.length === 0 && checkInRanking.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">🏆</div>
          <p className="text-lg font-medium text-navy-700">
            아직 랭킹 데이터가 없습니다
          </p>
          <p className="mt-2 text-sm text-navy-500">
            첫 번째 순례 인증을 남겨보세요!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {period && (
        <div className="mb-6 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <span>📅</span>
            <span className="font-medium">이번 주</span>
            <span className="text-blue-500">
              {formatPeriod(period.start, period.end)}
            </span>
          </div>
        </div>
      )}
      <RankingList
        spotRanking={spotRanking}
        checkInRanking={checkInRanking}
        onSpotClick={handleSpotClick}
        onCheckInClick={onCheckInClick}
      />
    </div>
  )
}

export default HallOfFameTab
