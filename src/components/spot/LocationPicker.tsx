'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Map as LeafletMap, Icon, LatLng } from 'leaflet'
import { Coordinates } from '@/types'

// 커스텀 마커 아이콘
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface LocationPickerProps {
  initialCoordinates?: Coordinates
  onLocationChange: (coordinates: Coordinates) => void
  onAddressSuggestion?: (address: string) => void
}

// 지도 클릭 이벤트 핸들러 컴포넌트
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (latlng: LatLng) => void
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng)
    },
  })
  return null
}

/**
 * 위치 선택 컴포넌트
 *
 * Requirements:
 * - 5.1: 지도 기반 위치 선택
 * - 5.2: 지도 클릭으로 마커 배치
 * - 5.3: 좌표 자동 업데이트
 * - 5.4: 마커 드래그 기능
 * - 5.5: 역지오코딩 주소 제안
 */
export function LocationPicker({
  initialCoordinates,
  onLocationChange,
  onAddressSuggestion,
}: LocationPickerProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const [markerPosition, setMarkerPosition] = useState<Coordinates | null>(
    initialCoordinates || null
  )
  const [isLoading, setIsLoading] = useState(false)

  // 초기 좌표가 변경되면 마커 위치 업데이트
  useEffect(() => {
    if (initialCoordinates) {
      setMarkerPosition(initialCoordinates)
      // 지도 중심도 이동
      if (mapRef.current) {
        mapRef.current.setView(
          [initialCoordinates.lat, initialCoordinates.lng],
          15
        )
      }
    }
  }, [initialCoordinates])

  // 역지오코딩 (좌표 → 주소) - Nominatim API 사용
  const reverseGeocode = useCallback(
    async (coordinates: Coordinates) => {
      if (!onAddressSuggestion) return

      setIsLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'ko,en',
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.display_name) {
            onAddressSuggestion(data.display_name)
          }
        }
      } catch {
        // 역지오코딩 실패 시 무시
      } finally {
        setIsLoading(false)
      }
    },
    [onAddressSuggestion]
  )

  // 위치 선택 핸들러
  const handleLocationSelect = useCallback(
    (latlng: LatLng) => {
      const coordinates: Coordinates = {
        lat: latlng.lat,
        lng: latlng.lng,
      }
      setMarkerPosition(coordinates)
      onLocationChange(coordinates)
      reverseGeocode(coordinates)
    },
    [onLocationChange, reverseGeocode]
  )

  // 마커 드래그 종료 핸들러
  const handleMarkerDragEnd = useCallback(
    (e: L.DragEndEvent) => {
      const marker = e.target
      const position = marker.getLatLng()
      const coordinates: Coordinates = {
        lat: position.lat,
        lng: position.lng,
      }
      setMarkerPosition(coordinates)
      onLocationChange(coordinates)
      reverseGeocode(coordinates)
    },
    [onLocationChange, reverseGeocode]
  )

  // 기본 중심 좌표 (서울)
  const defaultCenter: [number, number] = [37.5665, 126.978]
  const center: [number, number] = markerPosition
    ? [markerPosition.lat, markerPosition.lng]
    : defaultCenter

  return (
    <div className="relative">
      {/* 안내 메시지 */}
      <div className="mb-2 flex items-center gap-2 text-sm text-muted">
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
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>지도를 클릭하거나 마커를 드래그하여 위치를 선택하세요</span>
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin text-muted"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
      </div>

      {/* 지도 컨테이너 */}
      <div className="h-64 w-full overflow-hidden rounded-lg border-2 border-border">
        <MapContainer
          center={center}
          zoom={markerPosition ? 15 : 6}
          className="h-full w-full"
          ref={mapRef}
          zoomControl={false}
          scrollWheelZoom={true}
          doubleClickZoom={false}
          dragging={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* 클릭 이벤트 핸들러 */}
          <MapClickHandler onLocationSelect={handleLocationSelect} />

          {/* 마커 */}
          {markerPosition && (
            <Marker
              position={[markerPosition.lat, markerPosition.lng]}
              icon={customIcon}
              draggable={true}
              eventHandlers={{
                dragend: handleMarkerDragEnd,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* 줌 컨트롤 */}
      <div className="absolute right-2 top-10 z-[1000] flex flex-col gap-1">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="flex h-8 w-8 items-center justify-center rounded bg-surface shadow-md transition-colors hover:bg-neutral-100 dark:bg-neutral-800"
          aria-label="확대"
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
              d="M12 6v12m6-6H6"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="flex h-8 w-8 items-center justify-center rounded bg-surface shadow-md transition-colors hover:bg-neutral-100 dark:bg-neutral-800"
          aria-label="축소"
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
              d="M18 12H6"
            />
          </svg>
        </button>
      </div>

      {/* 선택된 좌표 표시 */}
      {markerPosition && (
        <div className="mt-2 rounded-lg border border-border bg-surface p-2">
          <p className="text-text-secondary text-xs">
            📍 {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  )
}
