'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType } from '@/types'
import SpotMarkerLayer from './SpotMarkerLayer'
import SpotPreview from './SpotPreview'
import BottomSheet from '@/components/mobile/BottomSheet'
import LocationButton from '@/components/mobile/LocationButton'
import GpsErrorFallback from '@/components/mobile/GpsErrorFallback'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import './map.css'

interface PilgrimageMapProps {
  initialCenter?: [number, number]
  initialZoom?: number
  className?: string
  spots?: SpotPinType[]
  onSpotSelect?: (spotId: string) => void
}

export default function PilgrimageMap({
  initialCenter,
  initialZoom,
  className = '',
  spots = [],
  onSpotSelect,
}: PilgrimageMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [gpsError, setGpsError] = useState<{
    code: string
    message: string
  } | null>(null)

  // Props를 직접 사용 (store 구독 불필요 — 줌/이동 시 리렌더 방지)
  const mapCenter = initialCenter ?? ([37.5665, 126.978] as [number, number])
  const mapZoom = initialZoom ?? 10

  // Leaflet 마커 아이콘 경로 설정 (로컬 경로로 변경)
  useEffect(() => {
    L.Icon.Default.imagePath = '/leaflet/'
  }, [])

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setGpsError(null)
    const map = mapRef.current
    if (map) {
      map.flyTo([lat, lng], 15, { duration: 1 })
    }
  }, [])

  const handleGpsError = useCallback(
    (error: { code: string; message: string }) => {
      setGpsError(error)
    },
    []
  )

  const handleDismissGpsError = useCallback(() => {
    setGpsError(null)
  }, [])

  // ResizeObserver 기반 invalidateSize - setTimeout 대신 컨테이너 크기 변경 감지
  const handleResize = useCallback(() => {
    mapRef.current?.invalidateSize()
  }, [])
  useResizeObserver(containerRef, handleResize)

  // 줌 중 마커 pane에 is-zooming 클래스 추가 → CSS로 transition/shadow 비활성화
  // whenReady 이후 mapRef가 설정되므로 별도 state로 트리거
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!mapReady) return
    const map = mapRef.current
    if (!map) return

    const markerPane = map.getPane('markerPane')
    const onZoomStart = () => markerPane?.classList.add('is-zooming')
    const onZoomEnd = () => markerPane?.classList.remove('is-zooming')

    map.on('zoomstart', onZoomStart)
    map.on('zoomend', onZoomEnd)

    return () => {
      map.off('zoomstart', onZoomStart)
      map.off('zoomend', onZoomEnd)
    }
  }, [mapReady])

  return (
    <div
      ref={containerRef}
      data-tour="map-marker"
      className={`relative h-full w-full ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full rounded-lg border-2 border-border"
        ref={mapRef}
        zoomControl={false} // 기본 줌 컨트롤 비활성화 (커스텀 컨트롤 사용)
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        bounceAtZoomLimits={false} // 줌 한계에서 바운스 방지
        minZoom={2} // 최소 줌 레벨 제한 (세계 지도 반복 방지)
        maxBounds={[
          [-90, -180], // 남서쪽 경계
          [90, 180], // 북동쪽 경계
        ]}
        maxBoundsViscosity={1.0} // 경계 밖으로 드래그 완전 방지
        whenReady={() => {
          // 지도가 준비되면 즉시 크기 재계산 (ResizeObserver가 이후 변경 감지)
          mapRef.current?.invalidateSize()
          setMapReady(true)
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
          maxZoom={19}
          tileSize={256}
          zoomOffset={0}
          noWrap={true} // 타일 반복 방지
        />

        {/* 스팟 핀 렌더링 — MarkerClusterGroup으로 관리 */}
        <SpotMarkerLayer spots={spots} onSpotSelect={onSpotSelect} />
      </MapContainer>

      {/* Custom map controls with navy theme */}
      <div className="absolute bottom-20 right-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            const map = mapRef.current
            if (map) {
              map.zoomIn()
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Zoom in"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        <button
          onClick={() => {
            const map = mapRef.current
            if (map) {
              map.zoomOut()
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white shadow-lg transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Zoom out"
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
              d="M18 12H6"
            />
          </svg>
        </button>
      </div>

      {/* 현재 위치 버튼 - 하단 우측 */}
      <LocationButton
        onLocationFound={handleLocationFound}
        onError={handleGpsError}
        className="absolute bottom-4 right-4 z-[1000]"
      />

      {/* GPS 에러 폴백 UI */}
      {gpsError && (
        <GpsErrorFallback error={gpsError} onDismiss={handleDismissGpsError} />
      )}

      {/* Map attribution with navy theme */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded bg-primary-800/80 px-2 py-1 text-xs text-white">
        Not a Trip
      </div>

      {/* 스팟 미리보기 - 데스크탑: 툴팁, 모바일: Bottom Sheet */}
      <SpotPreview className="hidden md:block" />
      <BottomSheet />
    </div>
  )
}
