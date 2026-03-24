'use client'

import { useMemo } from 'react'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import {
  getTravelMode,
  getTravelModeIcon,
  getGoogleMapsDirectionsUrl,
} from '@/lib/route-utils'
import type { RouteSpot } from '@/types/route'

interface NavigationPanelProps {
  /** 현재 목표 스팟 */
  currentSpot: RouteSpot
  /** 현재 목표 스팟의 인덱스 (0-based) */
  currentSpotIndex: number
  /** 전체 스팟 목록 */
  spots: RouteSpot[]
  /** 진행률 (0-100) */
  progress: number
  /** 다음 스팟까지 거리 (m) */
  distanceToNext: number | null
  /** 다음 스팟까지 예상 시간 (분) */
  estimatedTimeToNext: number | null
  /** 인증 완료 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 현재 위치 좌표 */
  currentPosition: { lat: number; lng: number } | null
  /** 완주 여부 */
  isCompleted: boolean
  /** 인증 버튼 클릭 핸들러 */
  onCheckIn: (spotId: string) => void
  /** 다음 스팟 이동 핸들러 */
  onMoveToNext: () => void
  /** 코스 종료 핸들러 */
  onEndRoute: () => void
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `약 ${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `약 ${h}시간 ${m}분` : `약 ${h}시간`
}

/**
 * NavigationPanel - 따라가기 모드 하단 패널
 *
 * 현재 목표 스팟 정보, 다음 스팟까지 거리/시간,
 * 진행률 바, 인증(Check-in) 버튼, 코스 종료 버튼
 * isAvailable:false 스팟 건너뛰기 처리
 * 오프라인 시 외부 지도 앱 연결 비활성화
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
export function NavigationPanel({
  currentSpot,
  currentSpotIndex,
  spots,
  progress,
  distanceToNext,
  estimatedTimeToNext,
  checkedSpotIds,
  currentPosition,
  isCompleted,
  onCheckIn,
  onMoveToNext,
  onEndRoute,
}: NavigationPanelProps) {
  const { isOnline } = useNetworkStatus()

  const isCurrentChecked = checkedSpotIds.includes(currentSpot.spotId)
  const isCurrentUnavailable = currentSpot.isAvailable === false
  const availableSpots = useMemo(
    () => spots.filter((s) => s.isAvailable !== false),
    [spots]
  )
  const checkedCount = useMemo(
    () =>
      availableSpots.filter((s) => checkedSpotIds.includes(s.spotId)).length,
    [availableSpots, checkedSpotIds]
  )

  // 다음 유효 스팟 찾기 (현재 스팟이 소실된 경우 건너뛰기용)
  const nextAvailableIndex = useMemo(() => {
    for (let i = currentSpotIndex + 1; i < spots.length; i++) {
      if (spots[i].isAvailable !== false) return i
    }
    return null
  }, [currentSpotIndex, spots])

  // 외부 지도 앱 URL
  const externalMapUrl = useMemo(() => {
    if (!currentPosition) return null
    return getGoogleMapsDirectionsUrl(
      currentPosition.lat,
      currentPosition.lng,
      currentSpot.coordinates.lat,
      currentSpot.coordinates.lng,
      getTravelMode(distanceToNext ?? 0)
    )
  }, [currentPosition, currentSpot.coordinates, distanceToNext])

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {/* 진행률 바 */}
      <div className="h-1.5 w-full bg-neutral-200">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 py-3">
        {/* 진행 상태 요약 */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>
            {checkedCount}/{availableSpots.length}곳 인증 완료
          </span>
          <span>{Math.round(progress)}%</span>
        </div>

        {/* 현재 목표 스팟 정보 */}
        <div className="mb-3 flex items-center gap-3">
          {/* 순서 번호 */}
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
              isCurrentUnavailable
                ? 'bg-gray-400'
                : isCurrentChecked
                  ? 'bg-green-600'
                  : 'bg-red-600'
            }`}
          >
            {currentSpotIndex + 1}
          </div>

          {/* 스팟 정보 */}
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm font-semibold ${
                isCurrentUnavailable
                  ? 'text-gray-400 line-through'
                  : 'text-text-primary'
              }`}
            >
              {isCurrentUnavailable ? '소실된 스팟' : currentSpot.spotName}
            </p>
            {/* 거리/시간 표시 */}
            {!isCurrentUnavailable && distanceToNext !== null && (
              <p className="text-xs text-muted">
                {getTravelModeIcon(getTravelMode(distanceToNext))}{' '}
                {formatDistance(distanceToNext)}
                {estimatedTimeToNext !== null &&
                  ` · ${formatTime(estimatedTimeToNext)}`}
              </p>
            )}
            {isCurrentUnavailable && (
              <p className="text-xs text-red-400">
                이 스팟은 소실되어 건너뜁니다
              </p>
            )}
          </div>

          {/* 외부 지도 앱 연결 */}
          {!isCurrentUnavailable && externalMapUrl && (
            <div className="relative flex-shrink-0">
              {isOnline ? (
                <a
                  href={externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                  aria-label="외부 지도 앱으로 경로 탐색"
                >
                  🗺️
                </a>
              ) : (
                <button
                  disabled
                  className="group relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-400"
                  aria-label="오프라인 상태에서는 외부 앱 연결이 불가합니다"
                >
                  🗺️
                  <span className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100">
                    오프라인 상태에서는 외부 앱 연결이 불가합니다
                  </span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          {isCompleted ? (
            <button
              onClick={onEndRoute}
              className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              🎉 완주 완료! 코스 종료
            </button>
          ) : isCurrentUnavailable ? (
            <>
              {nextAvailableIndex !== null && (
                <button
                  onClick={onMoveToNext}
                  className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  ⏭️ 다음 스팟으로 건너뛰기
                </button>
              )}
              <button
                onClick={onEndRoute}
                className="rounded-lg border-2 border-border bg-white px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-accent-surface"
              >
                종료
              </button>
            </>
          ) : isCurrentChecked ? (
            <>
              {nextAvailableIndex !== null && (
                <button
                  onClick={onMoveToNext}
                  className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                >
                  ➡️ 다음 스팟으로
                </button>
              )}
              <button
                onClick={onEndRoute}
                className="rounded-lg border-2 border-border bg-white px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-accent-surface"
              >
                종료
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onCheckIn(currentSpot.spotId)}
                className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
              >
                📸 이 스팟 인증하기
              </button>
              <button
                onClick={onEndRoute}
                className="rounded-lg border-2 border-border bg-white px-4 py-3 text-sm text-text-secondary transition-colors hover:bg-accent-surface"
              >
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
