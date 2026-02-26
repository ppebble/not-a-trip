/**
 * 지오펜싱 유틸리티 함수
 * 성지 제보 시스템에서 중복 제보 방지를 위한 거리 계산 및 바운딩 박스 생성
 */

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Haversine 공식으로 두 좌표 간 거리 계산 (미터 단위)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // 지구 반지름 (미터)
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 반경 내 근처 스팟/제보 검색을 위한 바운딩 박스 계산
 * MongoDB 쿼리 최적화용 (정확한 거리는 Haversine으로 후처리)
 */
export function getBoundingBox(lat: number, lng: number, radiusMeters: number) {
  const latDelta = radiusMeters / 111320
  const lngDelta = radiusMeters / (111320 * Math.cos(toRad(lat)))
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  }
}
