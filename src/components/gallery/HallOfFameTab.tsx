'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { RankingList, SpotRankingItem, CheckInRankingItem } from './RankingList'

/**
 * 랭킹 API 응답 타입
 */
interface RankingResponse {
  spotRanking: SpotRankingItem[]
  checkInRanking: CheckInRankingItem[]
  period: {
    start: string
    end: string
  }
}

export interface HallOfFameTabProps {
  /** 스팟 클릭 시 콜백 (기본: 스팟 상세 페이지로 이동) */
  onSpotClick?: (spotId: string) => void
  /** 인증샷 클릭 시 콜백 */
  onCheckInClick?: (checkInId: string) => void
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`
}

/**
 * 로딩 스켈레톤 컴포넌트
 */
function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* 기간 정보 스켈레톤 */}
      <div className="mb-6 flex items-center justify-center">
        <div className="h-6 w-48 animate-pulse rounded bg-navy-200" />
      </div>

      {/* 스팟 랭킹 스켈레톤 */}
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

      {/* 인증샷 랭킹 스켈레톤 */}
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
 * 에러 상태 컴포넌트
 */
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 text-5xl">😢</div>
        <p className="text-lg font-medium text-navy-700">
          데이터를 불러올 수 없습니다
        </p>
        <p className="mt-2 text-sm text-navy-500">잠시 후 다시 시도해주세요</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}

/**
 * 빈 상태 컴포넌트
 */
function EmptyState() {
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

/**
 * 명예의 전당 탭 컴포넌트
 * 이번 주 인기 스팟과 인기 인증샷 랭킹을 표시합니다.
 *
 * Requirements: 3.3
 * - WHEN the "명예의 전당" tab is active, THE Gallery_System SHALL display
 *   this week's most checked-in spots and most liked check-ins as a ranking
 */
export function HallOfFameTab({
  onSpotClick,
  onCheckInClick,
}: HallOfFameTabProps) {
  const router = useRouter()
  const [spotRanking, setSpotRanking] = useState<SpotRankingItem[]>([])
  const [checkInRanking, setCheckInRanking] = useState<CheckInRankingItem[]>([])
  const [period, setPeriod] = useState<{ start: string; end: string } | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRanking = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/checkins/ranking')

      if (!response.ok) {
        throw new Error('랭킹 데이터를 불러오는데 실패했습니다')
      }

      const data: RankingResponse = await response.json()

      setSpotRanking(data.spotRanking)
      setCheckInRanking(data.checkInRanking)
      setPeriod(data.period)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다'
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRanking()
  }, [fetchRanking])

  // 기본 스팟 클릭 핸들러: 스팟 상세 페이지로 이동
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

  // 로딩 상태
  if (isLoading) {
    return <LoadingSkeleton />
  }

  // 에러 상태
  if (error) {
    return <ErrorState onRetry={fetchRanking} />
  }

  // 빈 상태 (스팟 랭킹과 인증샷 랭킹 모두 비어있는 경우)
  const isEmpty = spotRanking.length === 0 && checkInRanking.length === 0
  if (isEmpty) {
    return <EmptyState />
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* 기간 정보 */}
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

      {/* 랭킹 리스트 */}
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
