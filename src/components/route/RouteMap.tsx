'use client'

import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import { Map as LeafletMap, DivIcon } from 'leaflet'
import type { RouteSpot, RouteStartPoint } from '@/types/route'
import { getTravelMode } from '@/lib/route-utils'
import { calculateDistance } from '@/lib/geo-utils'
import '../map/map.css'

interface RouteMapProps {
  spots: RouteSpot[]
  /** 시작 지점 (선택) */
  startPoint?: RouteStartPoint
  /** 현재 위치 (따라가기 모드용, 선택) */
  currentPosition?: { lat: number; lng: number } | null
  /** 현재 목표 스팟 인덱스 (따라가기 모드용, 선택) */
  currentSpotIndex?: number
  /** 인증 완료 스팟 ID 목록 (따라가기 모드용, 선택) */
  checkedSpotIds?: string[]
  className?: string
}

/** 순서 번호 마커 아이콘 생성 */
function createNumberIcon(
  num: number,
  isAvailable: boolean,
  isChecked: boolean,
  isCurrent: boolean
): DivIcon {
  let bgColor = '#345084' // navy-600
  let borderColor = '#4164a5' // navy-500
  let textDecoration = ''

  if (!isAvailable) {
    bgColor = '#9ca3af' // gray-400
    borderColor = '#6b7280' // gray-500
    textDecoration = 'line-through'
  } else if (isChecked) {
    bgColor = '#16a34a' // green-600
    borderColor = '#22c55e' // green-500
  } else if (isCurrent) {
    bgColor = '#dc2626' // red-600
    borderColor = '#ef4444' // red-500
  }

  return new DivIcon({
    className: 'route-number-marker',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${bgColor};border:2px solid ${borderColor};
      color:white;font-size:12px;font-weight:700;
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      text-decoration:${textDecoration};
    ">${num}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

/** 시작 지점 마커 아이콘 */
const startPointIcon = new DivIcon({
  className: 'start-point-marker',
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:#2563eb;border:2px solid #1d4ed8;
    color:white;font-size:14px;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  ">🏠</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
})

/** 현재 위치 마커 아이콘 */
const currentLocationIcon = new DivIcon({
  className: 'current-location-marker',
  html: `<div style="
    width:16px;height:16px;border-radius:50%;
    background:#3b82f6;border:3px solid white;
    box-shadow:0 0 0 2px #3b82f6,0 2px 8px rgba(59,130,246,0.5);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

/**
 * RouteMap - Leaflet 기반 코스 지도
 * 스팟 마커(순서 번호) + Polyline 연결
 * isAvailable:false 스팟은 회색 마커 + 취소선
 * ⚠️ 마커 클러스터링 비활성화 (순서 파악 필수)
 * Requirements: 2.3
 */
export default function RouteMap({
  spots,
  startPoint,
  currentPosition,
  currentSpotIndex,
  checkedSpotIds = [],
  className = '',
}: RouteMapProps) {
  const mapRef = useRef<LeafletMap | null>(null)

  // 유효 스팟 좌표로 지도 bounds 계산 (시작 지점 포함)
  const bounds = useMemo(() => {
    const coords = spots
      .filter((s) => s.coordinates)
      .map((s) => [s.coordinates.lat, s.coordinates.lng] as [number, number])
    if (startPoint?.coordinates) {
      coords.unshift([startPoint.coordinates.lat, startPoint.coordinates.lng])
    }
    if (coords.length === 0) return null
    return coords
  }, [spots, startPoint])

  // 구간별 Polyline 세그먼트 (거리 기반 스타일 분기)
  const routeSegments = useMemo(() => {
    const availableSpots = spots.filter((s) => s.isAvailable !== false)
    const segments: {
      positions: [number, number][]
      isDashed: boolean
    }[] = []
    for (let i = 1; i < availableSpots.length; i++) {
      const prev = availableSpots[i - 1]
      const curr = availableSpots[i]
      const distance = calculateDistance(
        prev.coordinates.lat,
        prev.coordinates.lng,
        curr.coordinates.lat,
        curr.coordinates.lng
      )
      const mode = getTravelMode(distance)
      segments.push({
        positions: [
          [prev.coordinates.lat, prev.coordinates.lng],
          [curr.coordinates.lat, curr.coordinates.lng],
        ],
        isDashed: mode !== 'walking',
      })
    }
    return segments
  }, [spots])

  // 소실 스팟 연결선 (점선)
  const unavailableSegments = useMemo(() => {
    const segments: [number, number][][] = []
    for (let i = 0; i < spots.length; i++) {
      if (spots[i].isAvailable === false) {
        // 이전 유효 스팟 ~ 소실 스팟 ~ 다음 유효 스팟
        const prev = spots
          .slice(0, i)
          .reverse()
          .find((s) => s.isAvailable !== false)
        const next = spots.slice(i + 1).find((s) => s.isAvailable !== false)
        if (prev && next) {
          segments.push([
            [prev.coordinates.lat, prev.coordinates.lng],
            [spots[i].coordinates.lat, spots[i].coordinates.lng],
            [next.coordinates.lat, next.coordinates.lng],
          ])
        }
      }
    }
    return segments
  }, [spots])

  const checkedSet = useMemo(() => new Set(checkedSpotIds), [checkedSpotIds])

  // 지도 bounds 맞추기
  useEffect(() => {
    const map = mapRef.current
    if (!map || !bounds || bounds.length === 0) return

    const timer = setTimeout(() => {
      map.invalidateSize()
      if (bounds.length === 1) {
        map.setView(bounds[0], 15)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const L = (window as any).L
        if (L) {
          const latLngBounds = bounds.reduce(
            (b: InstanceType<typeof L.LatLngBounds>, point: [number, number]) =>
              b.extend(point),
            new L.LatLngBounds()
          )
          map.fitBounds(latLngBounds, { padding: [30, 30] })
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [bounds])

  const defaultCenter: [number, number] =
    bounds && bounds.length > 0 ? bounds[0] : [35.6762, 139.6503]

  return (
    <div className={`relative w-full ${className}`} style={{ height: '400px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="overflow-hidden rounded-lg border-2 border-navy-200"
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          className="map-tiles"
          maxZoom={19}
        />

        {/* 구간별 Polyline (도보=실선, 대중교통/장거리=점선) */}
        {routeSegments.map((segment, idx) => (
          <Polyline
            key={`segment-${idx}`}
            positions={segment.positions}
            pathOptions={{
              color: segment.isDashed ? '#6b7280' : '#345084',
              weight: segment.isDashed ? 2 : 3,
              opacity: segment.isDashed ? 0.6 : 0.8,
              dashArray: segment.isDashed ? '8, 8' : undefined,
            }}
          />
        ))}

        {/* 소실 스팟 구간 점선 */}
        {unavailableSegments.map((segment, idx) => (
          <Polyline
            key={`unavail-${idx}`}
            positions={segment}
            pathOptions={{
              color: '#9ca3af',
              weight: 2,
              opacity: 0.5,
              dashArray: '8, 8',
            }}
          />
        ))}

        {/* 시작 지점 → 첫 스팟 연결선 */}
        {startPoint &&
          spots.length > 0 &&
          (() => {
            const firstAvailable = spots.find((s) => s.isAvailable !== false)
            if (!firstAvailable) return null
            const distance = calculateDistance(
              startPoint.coordinates.lat,
              startPoint.coordinates.lng,
              firstAvailable.coordinates.lat,
              firstAvailable.coordinates.lng
            )
            const mode = getTravelMode(distance)
            return (
              <Polyline
                positions={[
                  [startPoint.coordinates.lat, startPoint.coordinates.lng],
                  [
                    firstAvailable.coordinates.lat,
                    firstAvailable.coordinates.lng,
                  ],
                ]}
                pathOptions={{
                  color: mode === 'walking' ? '#2563eb' : '#6b7280',
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '6, 6',
                }}
              />
            )
          })()}

        {/* 시작 지점 마커 */}
        {startPoint && (
          <Marker
            position={[startPoint.coordinates.lat, startPoint.coordinates.lng]}
            icon={startPointIcon}
          >
            <Popup>
              <div className="min-w-[140px] p-1">
                <p className="text-sm font-semibold text-navy-900">
                  🏠 {startPoint.name}
                </p>
                <p className="mt-0.5 text-xs text-navy-400">
                  {startPoint.address}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 스팟 마커 (순서 번호) */}
        {spots.map((spot, idx) => (
          <Marker
            key={spot.spotId}
            position={[spot.coordinates.lat, spot.coordinates.lng]}
            icon={createNumberIcon(
              idx + 1,
              spot.isAvailable !== false,
              checkedSet.has(spot.spotId),
              currentSpotIndex === idx
            )}
          >
            <Popup>
              <div className="min-w-[160px] p-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-navy-800">
                    {idx + 1}.
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      spot.isAvailable === false
                        ? 'text-gray-400 line-through'
                        : 'text-navy-900'
                    }`}
                  >
                    {spot.spotName}
                  </span>
                </div>
                {spot.isAvailable === false && (
                  <p className="mt-1 text-xs text-red-500">소실된 스팟</p>
                )}
                {spot.distanceFromPrev && (
                  <p className="mt-1 text-xs text-navy-400">
                    이전 스팟에서 {spot.distanceFromPrev}m
                    {spot.walkTimeFromPrev &&
                      ` · 도보 ${spot.walkTimeFromPrev}분`}
                  </p>
                )}
                {spot.note && (
                  <p className="mt-1 text-xs text-navy-500">{spot.note}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 현재 위치 마커 (따라가기 모드) */}
        {currentPosition && (
          <Marker
            position={[currentPosition.lat, currentPosition.lng]}
            icon={currentLocationIcon}
          />
        )}
      </MapContainer>

      {/* 범례 */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {startPoint && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-[#2563eb]" />
              <span>시작</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-[#345084]" />
            <span>스팟</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-full bg-gray-400" />
            <span>소실됨</span>
          </div>
          {checkedSpotIds.length > 0 && (
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span>인증완료</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
