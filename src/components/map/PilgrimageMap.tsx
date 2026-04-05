'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { useShallow } from 'zustand/react/shallow'
import { useMapStore } from '@/stores/mapStore'
import { SpotPin as SpotPinType } from '@/types'
import SpotPin from './SpotPin'
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
  const { center, zoom, setCenter, setZoom } = useMapStore(
    useShallow((state) => ({
      center: state.center,
      zoom: state.zoom,
      setCenter: state.setCenter,
      setZoom: state.setZoom,
    }))
  )
  const [gpsError, setGpsError] = useState<{
    code: string
    message: string
  } | null>(null)

  // Use props if provided, otherwise use store values
  const mapCenter = initialCenter || center
  const mapZoom = initialZoom || zoom

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

  // Update store when map view changes
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const handleMoveEnd = () => {
      const newCenter = map.getCenter()
      setCenter([newCenter.lat, newCenter.lng])
    }

    const handleZoomEnd = () => {
      setZoom(map.getZoom())
    }

    map.on('moveend', handleMoveEnd)
    map.on('zoomend', handleZoomEnd)

    return () => {
      map.off('moveend', handleMoveEnd)
      map.off('zoomend', handleZoomEnd)
    }
  }, [setCenter, setZoom])

  return (
    <div ref={containerRef} className={`relative h-full w-full ${className}`}>
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
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.288255.xyz/{z}/{x}/{y}.png"
          className="map-tiles"
          maxZoom={19}
          tileSize={256}
          zoomOffset={0}
          noWrap={true} // 타일 반복 방지
        />

        {/* 스팟 핀 렌더링 */}
        {spots.map((spot) => (
          <SpotPin key={spot.id} spot={spot} onSelect={onSpotSelect} />
        ))}
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
