/**
 * 코스 거리/시간 계산 유틸리티
 * Spec: 10-pilgrimage-route
 */

import { calculateDistance } from '@/lib/geo-utils'

/** 도보 보정 계수 (직선거리 → 실제 도보거리 근사) */
const WALK_FACTOR = 1.3
/** 평균 도보 속도 (m/분) ≈ 4.8km/h */
const WALK_SPEED_M_PER_MIN = 80

/** 이동수단 타입 */
export type TravelMode = 'walking' | 'transit' | 'long_distance'

/** 거리 기반 이동수단 임계값 (미터) */
const WALK_THRESHOLD = 3000 // 3km 이내: 도보
const TRANSIT_THRESHOLD = 50000 // 50km 이내: 대중교통

/** 거리 기반 이동수단 판별 */
export function getTravelMode(distanceMeters: number): TravelMode {
  if (distanceMeters <= WALK_THRESHOLD) return 'walking'
  if (distanceMeters <= TRANSIT_THRESHOLD) return 'transit'
  return 'long_distance'
}

/** 이동수단별 라벨 */
export function getTravelModeLabel(mode: TravelMode): string {
  switch (mode) {
    case 'walking':
      return '도보'
    case 'transit':
      return '대중교통 권장'
    case 'long_distance':
      return '신칸센/항공 이동'
  }
}

/** 이동수단별 아이콘 */
export function getTravelModeIcon(mode: TravelMode): string {
  switch (mode) {
    case 'walking':
      return '🚶'
    case 'transit':
      return '🚃'
    case 'long_distance':
      return '🚄'
  }
}

/** 구글맵 두 지점 간 길찾기 URL 생성 */
export function getGoogleMapsDirectionsUrl(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  mode: TravelMode
): string {
  const travelmode = mode === 'walking' ? 'walking' : 'transit'
  return `https://www.google.com/maps/dir/?api=1&origin=${fromLat},${fromLng}&destination=${toLat},${toLng}&travelmode=${travelmode}`
}

/** 두 좌표 간 예상 도보 시간 (분) */
export function estimateWalkTime(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const distance = calculateDistance(lat1, lng1, lat2, lng2)
  const walkDistance = distance * WALK_FACTOR
  return Math.ceil(walkDistance / WALK_SPEED_M_PER_MIN)
}

/** 시작 지점 → 첫 스팟 거리/시간 계산 */
export function calculateStartToFirstSpot(
  startPoint: { coordinates: { lat: number; lng: number } },
  firstSpot: { coordinates: { lat: number; lng: number } }
): { distance: number; walkTime: number | null } | null {
  if (!startPoint?.coordinates || !firstSpot?.coordinates) return null
  const distance = Math.round(
    calculateDistance(
      startPoint.coordinates.lat,
      startPoint.coordinates.lng,
      firstSpot.coordinates.lat,
      firstSpot.coordinates.lng
    )
  )
  const mode = getTravelMode(distance)
  return {
    distance,
    walkTime:
      mode === 'walking'
        ? estimateWalkTime(
            startPoint.coordinates.lat,
            startPoint.coordinates.lng,
            firstSpot.coordinates.lat,
            firstSpot.coordinates.lng
          )
        : null,
  }
}

/** 코스 내 스팟 배열에 거리/시간 정보 채우기 */
export function calculateRouteDistances(
  spots: { coordinates: { lat: number; lng: number } }[]
): { distanceFromPrev: number | null; walkTimeFromPrev: number | null }[] {
  return spots.map((spot, i) => {
    if (i === 0) return { distanceFromPrev: null, walkTimeFromPrev: null }
    const prev = spots[i - 1]
    const distance = calculateDistance(
      prev.coordinates.lat,
      prev.coordinates.lng,
      spot.coordinates.lat,
      spot.coordinates.lng
    )
    const mode = getTravelMode(distance)
    return {
      distanceFromPrev: Math.round(distance),
      // 도보 시간은 도보 권장 거리일 때만 계산
      walkTimeFromPrev:
        mode === 'walking'
          ? estimateWalkTime(
              prev.coordinates.lat,
              prev.coordinates.lng,
              spot.coordinates.lat,
              spot.coordinates.lng
            )
          : null,
    }
  })
}
