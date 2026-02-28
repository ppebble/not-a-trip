/**
 * 코스 오프라인 캐시 상태 관리 훅
 * Spec: 10-pilgrimage-route, Requirements: 3.6
 */

'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Route } from '@/types/route'
import { prefetchRouteForOffline, isRouteCached } from '@/lib/route-cache'

interface UseRouteCacheReturn {
  /** 코스 데이터 프리패치 */
  prefetchRoute: (route: Route) => Promise<void>
  /** 캐시 완료 여부 */
  isCached: boolean
  /** 캐싱 진행 중 여부 */
  isPrefetching: boolean
}

export function useRouteCache(routeId?: string): UseRouteCacheReturn {
  const [isCached, setIsCached] = useState(false)
  const [isPrefetching, setIsPrefetching] = useState(false)

  // 초기 캐시 상태 확인
  useEffect(() => {
    if (!routeId) return
    isRouteCached(routeId).then(setIsCached)
  }, [routeId])

  // Service Worker로부터 프리패치 완료 메시지 수신
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = (event: MessageEvent) => {
      if (
        event.data?.type === 'ROUTE_PREFETCH_COMPLETE' &&
        event.data?.payload?.routeId === routeId
      ) {
        setIsCached(true)
        setIsPrefetching(false)
      }
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => {
      navigator.serviceWorker.removeEventListener('message', handler)
    }
  }, [routeId])

  const prefetchRoute = useCallback(async (route: Route) => {
    setIsPrefetching(true)
    try {
      await prefetchRouteForOffline(route)
      // SW 미지원 시 즉시 완료 처리
      if (!('serviceWorker' in navigator)) {
        setIsPrefetching(false)
      }
    } catch {
      setIsPrefetching(false)
    }
  }, [])

  return { prefetchRoute, isCached, isPrefetching }
}
