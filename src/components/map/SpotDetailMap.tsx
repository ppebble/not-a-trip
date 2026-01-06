'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Map as LeafletMap, Icon } from 'leaflet'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, FacilityType } from '@/types'
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
}

// 편의시설 타입별 한글 라벨
const facilityTypeLabels: Record<FacilityType, string> = {
  restaurant: '음식점',
  convenience_store: '편의점',
  cafe: '카페',
  station: '역/정류장',
  other: '기타',
}

export default function SpotDetailMap({
  spot,
  facilities = [],
  className = '',
}: SpotDetailMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)

  // 스팟 좌표가 유효한지 확인
  const hasValidCoordinates = spot.coordinates && spot.coordinates.length === 2
  const [lat, lng] = hasValidCoordinates
    ? spot.coordinates
    : [35.6762, 139.6503] // 기본값 설정

  // 지도 중심점과 줌 레벨 계산
  const mapCenter: [number, number] = [lat, lng]
  const mapZoom = 15 // 상세 페이지에서는 더 가까운 줌 레벨 사용

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // 지도가 완전히 로드된 후 실행
    const timer = setTimeout(() => {
      map.invalidateSize()

      // 스팟과 편의시설을 모두 포함하는 영역으로 지도 조정
      if (hasValidCoordinates && facilities.length > 0) {
        const allPoints = [[lat, lng], ...facilities.map((f) => f.coordinates)]

        const bounds = allPoints.reduce(
          (bounds: any, point) => {
            return bounds.extend(point)
          },
          new (window as any).L.LatLngBounds()
        )

        // 적절한 패딩을 추가하여 지도 영역 조정
        map.fitBounds(bounds, { padding: [20, 20] })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [lat, lng, facilities, hasValidCoordinates])

  console.log('SpotDetailMap - Rendering map component')

  return (
    <div className={`relative w-full ${className}`} style={{ height: '384px' }}>
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%' }}
        className="overflow-hidden rounded-lg border-2 border-navy-200"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
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
          crossOrigin=""
        />

        {/* 스팟 마커 */}
        <Marker position={[lat, lng]} icon={spotIcon}>
          <Popup>
            <div className="p-2">
              <h3 className="font-bold text-navy-900">{spot.name}</h3>
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
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={facility.coordinates}
            icon={facilityIcons[facility.type]}
          >
            <Popup>
              <div className="p-2">
                <div className="mb-1 flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    {facility.name}
                  </h4>
                  <span className="rounded bg-navy-100 px-2 py-1 text-xs text-navy-800">
                    {facilityTypeLabels[facility.type]}
                  </span>
                </div>
                <p className="mb-1 text-sm text-gray-600">{facility.address}</p>
                <p className="text-xs text-gray-500">
                  스팟에서 약 {Math.round(facility.distance)}m
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* 범례 */}
      {facilities.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm">
          <h4 className="mb-2 text-sm font-semibold text-gray-900">범례</h4>
          <div className="space-y-1">
            <div className="flex items-center text-xs">
              <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
              <span>성지순례 스팟</span>
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
      <div className="absolute bottom-2 right-2 z-[1000] rounded bg-navy-800/80 px-2 py-1 text-xs text-white">
        Anime Pilgrim
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
  }
  return colors[type] || 'bg-gray-500'
}
