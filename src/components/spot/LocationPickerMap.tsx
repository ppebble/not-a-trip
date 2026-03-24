'use client'

import { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'

interface LocationPickerMapContentProps {
  center: { lat: number; lng: number }
  selectedPos: { lat: number; lng: number } | null
  onMapClick: (pos: { lat: number; lng: number }) => void
}

interface LocationPickerMapProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (coordinates: { lat: number; lng: number }) => void
  /** 지도 초기 중심 좌표 (스팟 위치) */
  center: { lat: number; lng: number }
}

// Leaflet은 SSR 불가 → dynamic import
const MapContent = dynamic(
  () =>
    import('@/components/spot/LocationPickerMapContent').then(
      (mod) => mod.default
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <p className="text-sm text-gray-400">지도 로딩 중...</p>
      </div>
    ),
  }
) as React.ComponentType<LocationPickerMapContentProps>

/**
 * 위치 선택 미니 지도 모달
 *
 * 유저가 지도를 클릭하여 마커를 꽂고 [이 위치로 결정]을 누르면
 * 좌표가 콜백으로 전달됩니다.
 */
export default function LocationPickerMap({
  isOpen,
  onClose,
  onConfirm,
  center,
}: LocationPickerMapProps) {
  const [selectedPos, setSelectedPos] = useState<{
    lat: number
    lng: number
  } | null>(null)

  // 모달 열릴 때 초기화
  useEffect(() => {
    if (isOpen) setSelectedPos(null)
  }, [isOpen])

  const handleConfirm = useCallback(() => {
    if (selectedPos) {
      onConfirm(selectedPos)
      onClose()
    }
  }, [selectedPos, onConfirm, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-bold text-gray-900">
            📍 지도에서 위치 선택
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="닫기"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 안내 */}
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-2">
          <p className="text-xs text-gray-500">
            지도를 클릭하여 편의시설 위치를 지정해주세요
          </p>
        </div>

        {/* 지도 */}
        <div className="flex-1">
          <MapContent
            center={center}
            selectedPos={selectedPos}
            onMapClick={setSelectedPos}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="border-t border-gray-200 px-4 py-3">
          {selectedPos ? (
            <div className="mb-2 text-center text-xs text-gray-500">
              📍 {selectedPos.lat.toFixed(6)}, {selectedPos.lng.toFixed(6)}
            </div>
          ) : (
            <div className="mb-2 text-center text-xs text-gray-400">
              위치를 선택해주세요
            </div>
          )}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedPos}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:bg-gray-300 disabled:text-gray-500"
          >
            이 위치로 결정
          </button>
        </div>
      </div>
    </div>
  )
}
