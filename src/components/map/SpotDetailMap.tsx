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

// 스팟 마커 아이콘 (빨간색)
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

// 편의시설 타입별 마커 색상 및 아이콘
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
  // Otaku_Category
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

// 편의시설 타입별 한글 라벨
const facilityTypeLabels: Record<FacilityType, string> = {
  restaurant: '음식점',
  convenience_store: '편의점',
  cafe: '카페',
  station: '역/정류장',
  other: '기타',
  // Otaku_Category
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

  // 스팟 좌표가 유효한지 확인
  const hasValidCoordinates = spot.coordinates && spot.coordinates.length === 2
  const [lat, lng] = hasValidCoordinates
    ? spot.coordinates
    : [35.6762, 139.6503] // 기본값 설정

  // 지도 중심점과 줌 레벨 계산
  const mapCenter: [number, number] = [lat, lng]
  const mapZoom = 15 // 상세 페이지에서는 더 가까운 줌 레벨 사용

  // ResizeObserver 기반 invalidateSize + bounds 맞추기
  const fitMapBounds = useCallback(() => {
    const map = mapRef.current
    if (!map) return

    map.invalidateSize()

    // 스팟과 편의시설을 모두 포함하는 영역으로 지도 조정
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
        className="border-navy-200 overflow-hidden rounded-lg border-2"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        whenReady={() => {
          // 지도가 준비되면 즉시 크기 재계산 (ResizeObserver가 이후 변경 감지)
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

        {/* 스팟 마커 */}
        <Marker position={[lat, lng]} icon={spotIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="text-navy-900 font-bold">{spot.name}</h3>
              <p className="mt-1 text-sm text-gray-600">{spot.address}</p>
              {spot.description && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-700">
                  {spot.description}
                </p>
              )}
            </div>
          </Popup>
        </Marker>

        {/* 편의시설 마커들 */}
        {facilities.map((facility) => {
          // 좌표 유효성 검사
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
                <div className="p-2">
                  <div className="mb-1 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {facility.name}
                    </h4>
                    <span className="bg-navy-100 text-navy-800 rounded px-2 py-1 text-xs">
                      {facilityTypeLabels[facility.type]}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-gray-600">
                    {facility.address}
                  </p>
                  <p className="text-xs text-gray-500">
                    스팟에서 약 {Math.round(facility.distance)}m
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* 범례 */}
      {facilities.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">범례</h4>
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
              <span>특별한 여행지</span>
            </div>
            {Array.from(new Set(facilities.map((f) => f.type))).map((type) => (
              <div key={type} className="flex items-center text-xs">
                <div
                  className={`mr-2 h-3 w-3 rounded-full ${getFacilityColor(type)}`}
                ></div>
                <span>{facilityTypeLabels[type]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map attribution with navy theme */}
      <div className="bg-navy-800/80 absolute bottom-2 right-2 z-[1000] rounded px-2 py-1 text-xs text-white">
        Not a Trip
      </div>
    </div>
  )
}

// 편의시설 타입별 색상 클래스 반환
function getFacilityColor(type: FacilityType): string {
  const colors: Record<FacilityType, string> = {
    restaurant: 'bg-orange-500',
    convenience_store: 'bg-blue-500',
    cafe: 'bg-green-500',
    station: 'bg-purple-500',
    other: 'bg-gray-500',
    // Otaku_Category
    coin_locker: 'bg-violet-500',
    solo_dining: 'bg-rose-500',
    charging_cafe: 'bg-cyan-500',
    public_restroom: 'bg-teal-500',
    goods_shop: 'bg-pink-500',
  }
  return colors[type] || 'bg-gray-500'
}
