'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Map as LeafletMap } from 'leaflet'
import { useMapStore } from '@/stores/mapStore'
import { SpotPin as SpotPinType } from '@/types'
import SpotPin from './SpotPin'
import SpotPreview from './SpotPreview'
import BottomSheet from '@/components/mobile/BottomSheet'
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
  const { center, zoom, setCenter, setZoom } = useMapStore()

  // Use props if provided, otherwise use store values
  const mapCenter = initialCenter || center
  const mapZoom = initialZoom || zoom

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // 지도 크기 재계산 (중요!)
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    // Update store when map view changes
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
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full rounded-lg border-2 border-navy-200"
        ref={mapRef}
        zoomControl={false} // 기본 줌 컨트롤 비활성화 (커스텀 컨트롤 사용)
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        minZoom={2} // 최소 줌 레벨 제한 (세계 지도 반복 방지)
        maxBounds={[
          [-90, -180], // 남서쪽 경계
          [90, 180], // 북동쪽 경계
        ]}
        maxBoundsViscosity={1.0} // 경계 밖으로 드래그 완전 방지
        whenReady={() => {
          // 지도가 준비되면 크기 재계산
          setTimeout(() => {
            mapRef.current?.invalidateSize()
          }, 100)
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => {
            const map = mapRef.current
            if (map) {
              map.zoomIn()
            }
          }}
          className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-600 text-white shadow-lg transition-colors hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
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
          className="flex h-10 w-10 items-center justify-center rounded-md bg-navy-600 text-white shadow-lg transition-colors hover:bg-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:ring-offset-2"
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

      {/* Map attribution with navy theme */}
      <div className="absolute bottom-2 left-2 z-[1000] rounded bg-navy-800/80 px-2 py-1 text-xs text-white">
        Anime Pilgrim
      </div>

      {/* 스팟 미리보기 - 데스크탑: 툴팁, 모바일: Bottom Sheet */}
      <SpotPreview className="hidden md:block" />
      <BottomSheet />
    </div>
  )
}
