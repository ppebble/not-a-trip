/**
 * 코스 거리/시간 계산 유틸리티
 * Spec: 10-pilgrimage-route
 */

import { calculateDistance } from '@/lib/geo-utils'

/** 도보 보정 계수 (직선거리 → 실제 도보거리 근사) */
const WALK_FACTOR = 1.3
/** 평균 도보 속도 (m/분) ≈ 4.8km/h */
const WALK_SPEED_M_PER_MIN = 80

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
    const walkTime = estimateWalkTime(
      prev.coordinates.lat,
      prev.coordinates.lng,
      spot.coordinates.lat,
      spot.coordinates.lng
    )
    return {
      distanceFromPrev: Math.round(distance),
      walkTimeFromPrev: walkTime,
    }
  })
}
