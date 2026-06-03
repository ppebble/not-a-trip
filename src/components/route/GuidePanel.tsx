'use client'

import { useMemo } from 'react'
import DirectionsButton from '@/components/common/DirectionsButton'
import type { RouteSpot } from '@/types/route'

export interface GuidePanelProps {
  /** 코스의 전체 스팟 목록 */
  spots: RouteSpot[]
  /** 인증 완료 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 현재 목표 스팟 인덱스 */
  currentSpotIndex: number
  /** 진행률 (0-100) */
  progress: number
  /** 현재 위치 좌표 (길찾기 URL 생성용) */
  currentPosition: { lat: number; lng: number } | null
  /** GPS 정확도 (m) */
  accuracy: number | null
  /** 인증 버튼 클릭 핸들러 */
  onCheckIn: (spotId: string) => void
  /** 코스 종료 핸들러 */
  onEndRoute: () => void
  /** 완주 여부 */
  isCompleted: boolean
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
 * 코스 진행률 계산
 * (유효 스팟 중 체크된 수 / 전체 유효 스팟 수) × 100
 * 유효 스팟 = isAvailable !== false
 */
export function calculateProgress(
  spots: RouteSpot[],
  checkedSpotIds: string[]
): number {
  const availableSpots = spots.filter((s) => s.isAvailable !== false)
  if (availableSpots.length === 0) return 0
  const checkedCount = availableSpots.filter((s) =>
    checkedSpotIds.includes(s.spotId)
  ).length
  return (checkedCount / availableSpots.length) * 100
}

/**
 * GuidePanel - 순례 코스 체크리스트 가이드 패널
 *
 * 코스의 모든 스팟을 체크리스트 형태로 표시하며,
 * 각 스팟별 거리/시간, 길찾기, 인증 버튼을 제공한다.
 * NavigationPanel의 "현재 1개 스팟" 추적 방식 대신
 * "전체 스팟 체크리스트"를 한눈에 보여주는 가이드 UI.
 *
 * 단일 스팟 코스 처리 (Requirement 1.6):
 * - isSingleSpot 조건으로 거리/시간 정보 미표시
 * - 인증 UI는 스팟 수와 무관하게 항상 제공
 *
 * Requirements: 1.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10
 */
export function GuidePanel({
  spots,
  checkedSpotIds,
  currentSpotIndex,
  progress,
  currentPosition: _currentPosition,
  accuracy,
  onCheckIn,
  onEndRoute,
  isCompleted,
}: GuidePanelProps) {
  const availableSpots = useMemo(
    () => spots.filter((s) => s.isAvailable !== false),
    [spots]
  )

  const checkedCount = useMemo(
    () =>
      availableSpots.filter((s) => checkedSpotIds.includes(s.spotId)).length,
    [availableSpots, checkedSpotIds]
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      {/* 진행률 바 */}
      <div className="h-1.5 w-full bg-neutral-200">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="코스 진행률"
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

        {/* GPS 정확도 경고 */}
        {accuracy !== null && accuracy > 100 && (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            ⚠️ GPS 정확도가 낮습니다 ({Math.round(accuracy)}m). 실외로 이동하면
            정확도가 개선됩니다.
          </div>
        )}

        {/* 스팟 체크리스트 */}
        <div className="max-h-60 space-y-1 overflow-y-auto">
          {spots.map((spot, idx) => {
            const isChecked = checkedSpotIds.includes(spot.spotId)
            const isUnavailable = spot.isAvailable === false
            const isCurrent = idx === currentSpotIndex
            const isSingleSpot = availableSpots.length === 1

            return (
              <div
                key={spot.spotId}
                className={`flex items-center gap-3 rounded-lg p-2.5 ${
                  isUnavailable
                    ? 'bg-neutral-100'
                    : isCurrent
                      ? 'bg-primary-50'
                      : ''
                }`}
              >
                {/* 체크 상태 아이콘 */}
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isUnavailable
                      ? 'bg-neutral-300 text-neutral-500'
                      : isChecked
                        ? 'bg-green-500 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {isChecked ? '✓' : idx + 1}
                </div>

                {/* 스팟 정보 */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isUnavailable
                        ? 'text-neutral-400 line-through'
                        : isChecked
                          ? 'text-green-700'
                          : 'text-text-primary'
                    }`}
                  >
                    {spot.spotName}
                  </p>
                  {/* 거리/시간 표시: 단일 스팟이면 표시하지 않음 */}
                  {!isSingleSpot &&
                    !isUnavailable &&
                    spot.distanceFromPrev !== null &&
                    spot.distanceFromPrev > 0 && (
                      <p className="text-xs text-muted">
                        📍 {formatDistance(spot.distanceFromPrev)}
                        {spot.walkTimeFromPrev !== null &&
                          ` · ${formatTime(spot.walkTimeFromPrev)}`}
                      </p>
                    )}
                  {isUnavailable && (
                    <p className="text-xs text-neutral-400">건너뛰기</p>
                  )}
                </div>

                {/* 액션 버튼 영역 */}
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  {/* 길찾기 버튼 */}
                  {!isUnavailable && !isChecked && (
                    <DirectionsButton
                      lat={spot.coordinates.lat}
                      lng={spot.coordinates.lng}
                      destinationName={spot.spotName}
                      className="!px-2 !py-1.5 text-xs"
                    />
                  )}

                  {/* 인증 / 완료 상태 */}
                  {isUnavailable ? null : isChecked ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                      완료
                    </span>
                  ) : (
                    <button
                      onClick={() => onCheckIn(spot.spotId)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      여기서 인증하기
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* 하단 액션 버튼 */}
        <div className="mt-3">
          {isCompleted ? (
            <button
              onClick={onEndRoute}
              className="w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              🎉 완주 완료! 코스 종료
            </button>
          ) : (
            <button
              onClick={onEndRoute}
              className="w-full rounded-lg border-2 border-border bg-surface py-3 text-sm text-text-secondary transition-colors hover:bg-accent-surface"
            >
              코스 종료
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
