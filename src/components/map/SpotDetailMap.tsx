'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Map as LeafletMap, Icon } from 'leaflet'
import { SpotDetailData } from '@/hooks/useSpots'
import { NearbyFacility, FacilityType } from '@/types'
import 'leaflet/dist/leaflet.css'
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
  const [lat, lng] = hasValidCoordinates ? spot.coordinates : [0, 0]

  // 지도 중심점과 줌 레벨 계산
  const mapCenter: [number, number] = [lat, lng]
  const mapZoom = 15 // 상세 페이지에서는 더 가까운 줌 레벨 사용

  useEffect(() => {
    const map = mapRef.current
    if (!map || !hasValidCoordinates) return

    // 스팟과 편의시설을 모두 포함하는 영역으로 지도 조정
    if (facilities.length > 0) {
      const allPoints = [[lat, lng], ...facilities.map((f) => f.coordinates)]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bounds = allPoints.reduce(
        (bounds: any, point) => {
          return bounds.extend(point)
        },
        new (window as any).L.LatLngBounds()
      )

      // 적절한 패딩을 추가하여 지도 영역 조정
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [lat, lng, facilities, hasValidCoordinates])

  if (!hasValidCoordinates) {
    return (
      <div
        className={`flex h-64 items-center justify-center rounded-lg bg-gray-100 ${className}`}
      >
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto mb-2 h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p>위치 정보를 사용할 수 없습니다</p>
        </div>
      </div>
    )
  }

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
