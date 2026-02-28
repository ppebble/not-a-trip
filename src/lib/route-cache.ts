/**
 * 코스 오프라인 프리패치 유틸리티
 * Spec: 10-pilgrimage-route, Requirements: 3.6
 *
 * Service Worker에 PREFETCH_ROUTE 메시지를 전송하여
 * 코스 상세 API, 스팟 상세 API, 썸네일 URL을 캐싱한다.
 */

import type { Route } from '@/types/route'

/**
 * 코스 데이터를 오프라인용으로 프리패치
 * - Service Worker 미지원 시 graceful하게 무시
 */
export async function prefetchRouteForOffline(route: Route): Promise<void> {
  if (!('serviceWorker' in navigator)) return

  try {
    const registration = await navigator.serviceWorker.ready
    registration.active?.postMessage({
      type: 'PREFETCH_ROUTE',
      payload: {
        routeId: route.id,
        spots: route.spots.map((s) => ({
          spotId: s.spotId,
          thumbnailUrl: s.thumbnailUrl,
        })),
      },
    })
  } catch {
    // Service Worker 통신 실패 시 무시
  }
}

/**
 * 코스가 ROUTE_CACHE에 캐싱되어 있는지 확인
 */
export async function isRouteCached(routeId: string): Promise<boolean> {
  if (!('caches' in window)) return false

  try {
    const cache = await caches.open(`not-a-trip-route-v2`)
    const response = await cache.match(`/api/routes/${routeId}`)
    return !!response
  } catch {
    return false
  }
}
