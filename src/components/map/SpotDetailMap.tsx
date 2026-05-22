'use client'

import { useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Map as LeafletMap, divIcon, DivIcon } from 'leaflet'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, FacilityType } from '@/types'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import './map.css'

interface SpotDetailMapProps {
  spot: SpotDetailData
  facilities?: NearbyFacility[]
  className?: string
}

const FACILITY_THEME_COLORS: Record<FacilityType, string> = {
  restaurant: 'rgb(var(--link-schedule))',
  convenience_store: 'rgb(var(--color-primary-500))',
  cafe: 'rgb(var(--link-ticket))',
  station: 'rgb(var(--color-secondary-500))',
  other: 'rgb(var(--color-muted))',
  coin_locker: 'rgb(var(--color-secondary-600))',
  solo_dining: 'rgb(var(--color-danger))',
  charging_cafe: 'rgb(var(--link-official))',
  public_restroom: 'rgb(var(--link-ticket))',
  goods_shop: 'rgb(var(--content-game-fg))',
}

const facilityTypeLabels: Record<FacilityType, string> = {
  restaurant: '음식점',
  convenience_store: '편의점',
  cafe: '카페',
  station: '역/정류장',
  other: '기타',
  coin_locker: '코인 로커',
  solo_dining: '혼밥 식당',
  charging_cafe: '충전/와이파이',
  public_restroom: '화장실',
  goods_shop: '굿즈/상점',
}

function createMapPin(color: string, size: 'spot' | 'facility'): DivIcon {
  const pinSize = size === 'spot' ? 26 : 20
  const tailWidth = size === 'spot' ? 9 : 7
  const tailHeight = size === 'spot' ? 14 : 11

  return divIcon({
    className: `detail-map-pin detail-map-pin--${size}`,
    html: `<div style="width:${pinSize}px;height:${pinSize + tailHeight}px;display:flex;flex-direction:column;align-items:center;">
      <div style="width:${pinSize}px;height:${pinSize}px;border-radius:9999px;background:${color};border:2px solid rgb(var(--color-surface));box-shadow:0 4px 12px rgb(var(--color-text) / 0.22);"></div>
      <div style="width:0;height:0;border-left:${tailWidth}px solid transparent;border-right:${tailWidth}px solid transparent;border-top:${tailHeight}px solid ${color};margin-top:-2px;"></div>
    </div>`,
    iconSize: [pinSize, pinSize + tailHeight],
    iconAnchor: [pinSize / 2, pinSize + tailHeight],
    popupAnchor: [0, -(pinSize + tailHeight - 8)],
  })
}

const spotIcon = createMapPin('rgb(var(--color-danger))', 'spot')

const facilityIcons: Record<FacilityType, DivIcon> = {
  restaurant: createMapPin(FACILITY_THEME_COLORS.restaurant, 'facility'),
  convenience_store: createMapPin(
    FACILITY_THEME_COLORS.convenience_store,
    'facility'
  ),
  cafe: createMapPin(FACILITY_THEME_COLORS.cafe, 'facility'),
  station: createMapPin(FACILITY_THEME_COLORS.station, 'facility'),
  other: createMapPin(FACILITY_THEME_COLORS.other, 'facility'),
  coin_locker: createMapPin(FACILITY_THEME_COLORS.coin_locker, 'facility'),
  solo_dining: createMapPin(FACILITY_THEME_COLORS.solo_dining, 'facility'),
  charging_cafe: createMapPin(FACILITY_THEME_COLORS.charging_cafe, 'facility'),
  public_restroom: createMapPin(
    FACILITY_THEME_COLORS.public_restroom,
    'facility'
  ),
  goods_shop: createMapPin(FACILITY_THEME_COLORS.goods_shop, 'facility'),
}

function getFacilityColor(type: FacilityType): string {
  return FACILITY_THEME_COLORS[type] || 'rgb(var(--color-muted))'
}

export default function SpotDetailMap({
  spot,
  facilities = [],
  className = '',
}: SpotDetailMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const hasValidCoordinates = spot.coordinates && spot.coordinates.length === 2
  const [lat, lng] = hasValidCoordinates
    ? spot.coordinates
    : [35.6762, 139.6503]

  const mapCenter: [number, number] = [lat, lng]
  const mapZoom = 15

  const fitMapBounds = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    map.invalidateSize()

    if (hasValidCoordinates && facilities.length > 0) {
      const allPoints = [[lat, lng], ...facilities.map((f) => f.coordinates)]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L
      if (L) {
        const latLngBounds = new L.LatLngBounds()
        allPoints.forEach((point: number[]) => {
          latLngBounds.extend(point)
        })

        map.fitBounds(latLngBounds, { padding: [20, 20] })
      }
    }
  }, [lat, lng, facilities, hasValidCoordinates])

  useResizeObserver(containerRef, fitMapBounds)

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ height: '384px' }}
    >
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="overflow-hidden rounded-lg border-2 border-border"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        whenReady={() => {
          mapRef.current?.invalidateSize()
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="map-tiles"
          maxZoom={19}
          tileSize={256}
          zoomOffset={0}
          crossOrigin=""
        />

        <Marker position={[lat, lng]} icon={spotIcon}>
          <Popup>
            <div className="spot-detail-popup-content p-2 text-main-text">
              <h3 className="font-bold text-main-text">{spot.name}</h3>
              <p className="mt-1 text-sm text-sub-text">{spot.address}</p>
              {spot.description && (
                <p className="mt-2 line-clamp-3 text-sm text-sub-text">
                  {spot.description}
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {facilities.map((facility) => {
          const coords = facility.coordinates
          if (!coords || !Array.isArray(coords) || coords.length !== 2) {
            return null
          }

          return (
            <Marker
              key={facility.id}
              position={[coords[0], coords[1]]}
              icon={facilityIcons[facility.type]}
            >
              <Popup>
                <div className="spot-detail-popup-content p-2 text-main-text">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-semibold text-main-text">
                      {facility.name}
                    </h4>
                    <span className="facility-popup-chip rounded px-2 py-1 text-xs">
                      {facilityTypeLabels[facility.type]}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-sub-text">
                    {facility.address}
                  </p>
                  <p className="text-xs text-sub-text">
                    스팟에서 약 {Math.round(facility.distance)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {facilities.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-surface/90 p-3 text-main-text shadow-lg backdrop-blur-sm">
          <h4 className="mb-2 text-sm font-semibold text-main-text">범례</h4>
          <div className="space-y-1">
            <div className="flex items-center text-xs text-sub-text">
              <div
                className="mr-2 h-3 w-3 rounded-full"
                style={{ backgroundColor: 'rgb(var(--color-danger))' }}
              ></div>
              <span>성지 본체</span>
            </div>
            {Array.from(new Set(facilities.map((f) => f.type))).map((type) => (
              <div
                key={type}
                className="flex items-center text-xs text-sub-text"
              >
                <div
                  className="mr-2 h-3 w-3 rounded-full"
                  style={{ backgroundColor: getFacilityColor(type) }}
                ></div>
                <span>{facilityTypeLabels[type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-text absolute bottom-2 right-2 z-[1000] rounded bg-surface/90 px-2 py-1 text-xs shadow-sm backdrop-blur-sm">
        Not a Trip
      </div>
    </div>
  )
}
