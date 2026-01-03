'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Map as LeafletMap } from 'leaflet'
import { useMapStore } from '@/stores/mapStore'
import { SpotPin as SpotPinType } from '@/types'
import SpotPin from './SpotPin'
import 'leaflet/dist/leaflet.css'
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
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
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
        Anime Pilgrimage Map
      </div>
    </div>
  )
}
