'use client'

import { useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Map as LeafletMap, Icon } from 'leaflet'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, FacilityType } from '@/types'
import { useResizeObserver } from '@/hooks/useResizeObserver'
import './map.css'

interface SpotDetailMapProps {
  spot: SpotDetailData
  facilities?: NearbyFacility[]
  className?: string
}

const spotIcon = new Icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const facilityIcons: Record<FacilityType, Icon> = {
  restaurant: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  convenience_store: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  cafe: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  station: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  other: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  coin_locker: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  solo_dining: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  charging_cafe: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  public_restroom: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
  goods_shop: new Icon({
    iconUrl:
      'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [20, 33],
    iconAnchor: [10, 33],
    popupAnchor: [1, -28],
    shadowSize: [33, 33],
  }),
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
  goods_shop: '굿즈/잡화',
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
              <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
              <span>특별한 여행지</span>
            </div>
            {Array.from(new Set(facilities.map((f) => f.type))).map((type) => (
              <div
                key={type}
                className="flex items-center text-xs text-sub-text"
              >
                <div
                  className={`mr-2 h-3 w-3 rounded-full ${getFacilityColor(type)}`}
                ></div>
                <span>{facilityTypeLabels[type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="absolute bottom-2 right-2 z-[1000] rounded bg-primary-800/80 px-2 py-1 text-xs text-white">
        Not a Trip
      </div>
    </div>
  )
}

function getFacilityColor(type: FacilityType): string {
  const colors: Record<FacilityType, string> = {
    restaurant: 'bg-orange-500',
    convenience_store: 'bg-primary',
    cafe: 'bg-green-500',
    station: 'bg-purple-500',
    other: 'bg-neutral-500',
    coin_locker: 'bg-violet-500',
    solo_dining: 'bg-rose-500',
    charging_cafe: 'bg-cyan-500',
    public_restroom: 'bg-teal-500',
    goods_shop: 'bg-pink-500',
  }

  return colors[type] || 'bg-neutral-500'
}
