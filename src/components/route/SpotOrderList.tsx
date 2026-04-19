'use client'

import { useState, useCallback, useRef } from 'react'
import type { RouteSpot, RouteStartPoint } from '@/types/route'
import { OptimizedImage } from '@/components/common'
import {
  getTravelMode,
  getTravelModeLabel,
  getTravelModeIcon,
  getGoogleMapsDirectionsUrl,
  calculateStartToFirstSpot,
} from '@/lib/route-utils'

/** 스팟 순서 관리용 아이템 (생성/수정 폼에서 사용) */
export interface SpotOrderItem {
  spotId: string
  spotName: string
  coordinates: { lat: number; lng: number }
  thumbnailUrl: string
  note?: string
  /** 클라이언트에서 계산된 거리/시간 (읽기 전용 표시용) */
  distanceFromPrev: number | null
  walkTimeFromPrev: number | null
}

interface SpotOrderListProps {
  spots: SpotOrderItem[]
  onSpotsChange: (spots: SpotOrderItem[]) => void
  /** 시작 지점 (선택) */
  startPoint?: RouteStartPoint
}

/** 거리 포맷 */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * SpotOrderList - 스팟 순서 관리 컴포넌트
 * 드래그 앤 드롭으로 순서 변경, 거리/시간 표시, 메모 입력
 * Requirements: 1.2, 1.3
 */
export function SpotOrderList({
  spots,
  onSpotsChange,
  startPoint,
}: SpotOrderListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const noteInputRef = useRef<HTMLTextAreaElement>(null)

  /** 드래그 시작 */
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index)
  }, [])

  /** 드래그 오버 */
  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === index) return
      setDragOverIndex(index)
    },
    [draggedIndex]
  )

  /** 드롭 - 순서 변경 */
  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault()
      if (draggedIndex === null || draggedIndex === dropIndex) return

      const newSpots = [...spots]
      const [dragged] = newSpots.splice(draggedIndex, 1)
      newSpots.splice(dropIndex, 0, dragged)
      onSpotsChange(newSpots)
      setDraggedIndex(null)
      setDragOverIndex(null)
    },
    [draggedIndex, spots, onSpotsChange]
  )

  /** 드래그 종료 */
  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }, [])

  /** 스팟 삭제 */
  const handleRemove = useCallback(
    (index: number) => {
      onSpotsChange(spots.filter((_, i) => i !== index))
    },
    [spots, onSpotsChange]
  )

  /** 메모 업데이트 */
  const handleNoteChange = useCallback(
    (index: number, note: string) => {
      const newSpots = [...spots]
      newSpots[index] = { ...newSpots[index], note: note || undefined }
      onSpotsChange(newSpots)
    },
    [spots, onSpotsChange]
  )

  if (spots.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted">
          스팟을 검색하여 코스에 추가해주세요
        </p>
        <p className="mt-1 text-xs text-neutral-300 dark:text-neutral-700">
          최소 1개의 스팟이 필요합니다
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* 시작 지점 → 첫 스팟 이동 정보 */}
      {startPoint &&
        spots.length > 0 &&
        (() => {
          const info = calculateStartToFirstSpot(startPoint, spots[0])
          if (!info) return null
          const mode = getTravelMode(info.distance)
          return (
            <div className="mb-1">
              <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2">
                <span className="text-sm">🏠</span>
                <span className="text-text-secondary text-xs font-medium">
                  {startPoint.name}
                </span>
              </div>
              <div className="flex items-center gap-2 py-1.5 pl-8">
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">
                    ↓ {formatDistance(info.distance)}
                    {' · '}
                    {getTravelModeIcon(mode)}{' '}
                    {mode === 'walking' && info.walkTime !== null
                      ? `도보 약 ${info.walkTime}분`
                      : getTravelModeLabel(mode)}
                  </span>
                  {mode !== 'walking' && (
                    <a
                      href={getGoogleMapsDirectionsUrl(
                        startPoint.coordinates.lat,
                        startPoint.coordinates.lng,
                        spots[0].coordinates.lat,
                        spots[0].coordinates.lng,
                        mode
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary-100"
                    >
                      길찾기 →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })()}

      {spots.map((spot, idx) => (
        <div key={`${spot.spotId}-${idx}`}>
          {/* 이동 거리/시간 표시 (첫 스팟 제외) */}
          {idx > 0 && spot.distanceFromPrev !== null && (
            <div className="flex items-center gap-2 py-1.5 pl-8">
              <div className="h-4 w-px bg-border" />
              {(() => {
                const mode = getTravelMode(spot.distanceFromPrev)
                const prev = spots[idx - 1]
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      ↓ {formatDistance(spot.distanceFromPrev)}
                      {' · '}
                      {getTravelModeIcon(mode)}{' '}
                      {mode === 'walking' && spot.walkTimeFromPrev !== null
                        ? `도보 약 ${spot.walkTimeFromPrev}분`
                        : getTravelModeLabel(mode)}
                    </span>
                    {mode !== 'walking' && (
                      <a
                        href={getGoogleMapsDirectionsUrl(
                          prev.coordinates.lat,
                          prev.coordinates.lng,
                          spot.coordinates.lat,
                          spot.coordinates.lng,
                          mode
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-medium text-primary transition-colors hover:bg-primary-100"
                      >
                        길찾기 →
                      </a>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* 스팟 카드 */}
          <div
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={(e) => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
              draggedIndex === idx
                ? 'border-primary-400 bg-primary-50 opacity-50'
                : dragOverIndex === idx
                  ? 'border-primary bg-primary-50'
                  : 'border-border bg-surface hover:border-neutral-300'
            } cursor-grab active:cursor-grabbing`}
          >
            {/* 드래그 핸들 + 순서 번호 */}
            <div className="flex flex-shrink-0 flex-col items-center gap-1">
              <span className="text-xs text-neutral-300">⠿</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {idx + 1}
              </div>
            </div>

            {/* 썸네일 */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
              {spot.thumbnailUrl ? (
                <OptimizedImage
                  src={spot.thumbnailUrl}
                  alt={spot.spotName}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-lg text-muted">
                  📍
                </div>
              )}
            </div>

            {/* 스팟 정보 */}
            <div className="min-w-0 flex-1">
              <p className="text-text-primary truncate text-sm font-medium">
                {spot.spotName}
              </p>
              {spot.note && editingNoteIndex !== idx && (
                <p className="truncate text-xs text-muted">{spot.note}</p>
              )}
              {editingNoteIndex === idx && (
                <textarea
                  ref={noteInputRef}
                  defaultValue={spot.note || ''}
                  placeholder="메모 입력..."
                  rows={2}
                  className="text-text-secondary mt-1 w-full resize-none rounded border border-border px-2 py-1 text-xs focus:border-primary-400 focus:outline-none"
                  onBlur={(e) => {
                    handleNoteChange(idx, e.target.value)
                    setEditingNoteIndex(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleNoteChange(idx, e.currentTarget.value)
                      setEditingNoteIndex(null)
                    }
                  }}
                  autoFocus
                />
              )}
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-shrink-0 gap-1">
              <button
                type="button"
                onClick={() =>
                  setEditingNoteIndex(editingNoteIndex === idx ? null : idx)
                }
                className="rounded p-1.5 text-muted transition-colors hover:bg-primary-50 hover:text-primary"
                title="메모"
              >
                📝
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="rounded p-1.5 text-muted transition-colors hover:bg-red-50 hover:text-red-500"
                title="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}

      {spots.length === 1 && (
        <p className="mt-2 text-center text-xs text-primary">
          💡 더 많은 스팟을 추가하면 풍성한 순례 경험을 만들 수 있어요!
        </p>
      )}
    </div>
  )
}

/** RouteSpot → SpotOrderItem 변환 유틸리티 */
export function routeSpotToOrderItem(spot: RouteSpot): SpotOrderItem {
  return {
    spotId: spot.spotId,
    spotName: spot.spotName,
    coordinates: spot.coordinates,
    thumbnailUrl: spot.thumbnailUrl,
    note: spot.note,
    distanceFromPrev: spot.distanceFromPrev,
    walkTimeFromPrev: spot.walkTimeFromPrev,
  }
}
