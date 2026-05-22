'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Map as LeafletMap } from 'leaflet'
import L from 'leaflet'
import { SpotPin as SpotPinType } from '@/types'
import SpotMarkerLayer from './SpotMarkerLayer'
import CurrentLocationMarker from './CurrentLocationMarker'
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
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null)

  const mapCenter = initialCenter ?? ([37.5665, 126.978] as [number, number])
  const mapZoom = initialZoom ?? 10

  useEffect(() => {
    L.Icon.Default.imagePath = '/leaflet/'
  }, [])

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setGpsError(null)
    setCurrentLocation([lat, lng])
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

  const handleResize = useCallback(() => {
    mapRef.current?.invalidateSize()
  }, [])
  useResizeObserver(containerRef, handleResize)

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
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        bounceAtZoomLimits={false}
        minZoom={2}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        maxBoundsViscosity={1.0}
        whenReady={() => {
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
          noWrap={true}
        />

        <SpotMarkerLayer spots={spots} onSpotSelect={onSpotSelect} />
        {currentLocation ? (
          <CurrentLocationMarker position={currentLocation} />
        ) : null}
      </MapContainer>

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

      <LocationButton
        onLocationFound={handleLocationFound}
        onError={handleGpsError}
        className="absolute bottom-4 right-4 z-[1000]"
      />

      {gpsError && (
        <GpsErrorFallback error={gpsError} onDismiss={handleDismissGpsError} />
      )}

      <div className="text-text absolute bottom-2 left-2 z-[1000] rounded bg-surface/90 px-2 py-1 text-xs shadow-sm backdrop-blur-sm">
        Not a Trip
      </div>

      <SpotPreview className="hidden md:block" />
      <BottomSheet />
    </div>
  )
}
