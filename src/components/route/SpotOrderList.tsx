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
      <div className="border-navy-200 rounded-lg border-2 border-dashed p-8 text-center">
        <p className="text-navy-400 text-sm">
          스팟을 검색하여 코스에 추가해주세요
        </p>
        <p className="text-navy-300 mt-1 text-xs">
          최소 2개의 스팟이 필요합니다
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
              <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
                <span className="text-sm">🏠</span>
                <span className="text-navy-700 text-xs font-medium">
                  {startPoint.name}
                </span>
              </div>
              <div className="flex items-center gap-2 py-1.5 pl-8">
                <div className="bg-navy-200 h-4 w-px" />
                <div className="flex items-center gap-2">
                  <span className="text-navy-400 text-xs">
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
                      className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-100"
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
              <div className="bg-navy-200 h-4 w-px" />
              {(() => {
                const mode = getTravelMode(spot.distanceFromPrev)
                const prev = spots[idx - 1]
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-navy-400 text-xs">
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
                        className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 transition-colors hover:bg-blue-100"
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
                ? 'border-navy-400 bg-navy-50 opacity-50'
                : dragOverIndex === idx
                  ? 'border-navy-500 bg-navy-50'
                  : 'border-navy-200 hover:border-navy-300 bg-white'
            } cursor-grab active:cursor-grabbing`}
          >
            {/* 드래그 핸들 + 순서 번호 */}
            <div className="flex flex-shrink-0 flex-col items-center gap-1">
              <span className="text-navy-300 text-xs">⠿</span>
              <div className="bg-navy-600 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white">
                {idx + 1}
              </div>
            </div>

            {/* 썸네일 */}
            <div className="bg-navy-100 h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
              {spot.thumbnailUrl ? (
                <OptimizedImage
                  src={spot.thumbnailUrl}
                  alt={spot.spotName}
                  width={48}
                  height={48}
                  className="object-cover"
                />
              ) : (
                <div className="text-navy-300 flex h-full items-center justify-center text-lg">
                  📍
                </div>
              )}
            </div>

            {/* 스팟 정보 */}
            <div className="min-w-0 flex-1">
              <p className="text-navy-900 truncate text-sm font-medium">
                {spot.spotName}
              </p>
              {spot.note && editingNoteIndex !== idx && (
                <p className="text-navy-400 truncate text-xs">{spot.note}</p>
              )}
              {editingNoteIndex === idx && (
                <textarea
                  ref={noteInputRef}
                  defaultValue={spot.note || ''}
                  placeholder="메모 입력..."
                  rows={2}
                  className="border-navy-200 text-navy-700 focus:border-navy-400 mt-1 w-full resize-none rounded border px-2 py-1 text-xs focus:outline-none"
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
                className="text-navy-400 hover:bg-navy-50 hover:text-navy-600 rounded p-1.5 transition-colors"
                title="메모"
              >
                📝
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="text-navy-400 rounded p-1.5 transition-colors hover:bg-red-50 hover:text-red-500"
                title="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}

      {spots.length < 2 && (
        <p className="mt-2 text-center text-xs text-amber-600">
          ⚠️ 코스에는 최소 2개의 스팟이 필요합니다 (현재 {spots.length}개)
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
