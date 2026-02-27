/**
 * useRouteNavigation 훅
 * 코스 따라가기 모드의 네비게이션 로직
 *
 * courseProgressStore + useGeolocation 조합
 * 현재 위치 기반 다음 스팟까지 거리/시간 실시간 계산
 * 진행률 계산 및 완주 판정
 *
 * @requirements 3.1, 3.3, 3.4, 3.5
 */

'use client'

import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useCourseProgressStore } from '@/stores/courseProgressStore'
import { useGeolocation } from '@/hooks/useGeolocation'
import { calculateDistance } from '@/lib/geo-utils'
import { estimateWalkTime } from '@/lib/route-utils'
import type { Route } from '@/types/route'

export interface UseRouteNavigationReturn {
  /** 현재 진행 중인 코스 */
  activeRoute: Route | null
  /** 현재 목표 스팟 인덱스 */
  currentSpotIndex: number
  /** 인증 완료한 스팟 ID 목록 */
  checkedSpotIds: string[]
  /** 진행률 (0-100) */
  progress: number
  /** 다음 스팟까지 거리 (m) */
  distanceToNext: number | null
  /** 다음 스팟까지 예상 시간 (분) */
  estimatedTimeToNext: number | null
  /** 코스 시작 */
  startRoute: (route: Route, userId: string) => Promise<void>
  /** 스팟 인증 완료 처리 */
  checkInSpot: (spotId: string) => void
  /** 다음 스팟으로 이동 */
  moveToNextSpot: () => void
  /** 코스 종료 */
  endRoute: () => void
  /** 코스 완주 여부 */
  isCompleted: boolean
  /** 네비게이션 활성 여부 */
  isNavigating: boolean
  /** 현재 위치 좌표 */
  currentPosition: { lat: number; lng: number } | null
  /** GPS 정확도 (m) */
  accuracy: number | null
}

export function useRouteNavigation(): UseRouteNavigationReturn {
  const store = useCourseProgressStore()
  const completionCalledRef = useRef(false)

  const {
    activeRoute,
    currentSpotIndex,
    checkedSpotIds,
    isNavigating,
    startRoute,
    checkInSpot,
    moveToNextSpot,
    endRoute: storeEndRoute,
    resetProgress,
  } = store

  // 네비게이션 활성 시 위치 감시
  const geo = useGeolocation({ enableHighAccuracy: true, timeout: 15000 })

  useEffect(() => {
    if (isNavigating) {
      geo.watchPosition()
    } else {
      geo.clearWatch()
    }
    return () => geo.clearWatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNavigating])

  // 유효 스팟 목록 (isAvailable !== false)
  const availableSpots = useMemo(() => {
    if (!activeRoute) return []
    return activeRoute.spots.filter((s) => s.isAvailable !== false)
  }, [activeRoute])

  // 진행률 계산: (인증된 유효 스팟 수 / 유효 스팟 수) * 100
  const progress = useMemo(() => {
    if (availableSpots.length === 0) return 0
    const checkedCount = availableSpots.filter((s) =>
      checkedSpotIds.has(s.spotId)
    ).length
    return (checkedCount / availableSpots.length) * 100
  }, [availableSpots, checkedSpotIds])

  // 완주 판정: 유효 스팟 전체 인증 시
  const isCompleted = useMemo(() => {
    if (availableSpots.length === 0) return false
    return availableSpots.every((s) => checkedSpotIds.has(s.spotId))
  }, [availableSpots, checkedSpotIds])

  // 현재 목표 스팟까지 거리/시간
  const distanceToNext = useMemo(() => {
    if (!activeRoute || !geo.coordinates) return null
    const targetSpot = activeRoute.spots[currentSpotIndex]
    if (!targetSpot) return null
    return Math.round(
      calculateDistance(
        geo.coordinates.lat,
        geo.coordinates.lng,
        targetSpot.coordinates.lat,
        targetSpot.coordinates.lng
      )
    )
  }, [activeRoute, currentSpotIndex, geo.coordinates])

  const estimatedTimeToNext = useMemo(() => {
    if (!activeRoute || !geo.coordinates) return null
    const targetSpot = activeRoute.spots[currentSpotIndex]
    if (!targetSpot) return null
    return estimateWalkTime(
      geo.coordinates.lat,
      geo.coordinates.lng,
      targetSpot.coordinates.lat,
      targetSpot.coordinates.lng
    )
  }, [activeRoute, currentSpotIndex, geo.coordinates])

  // 완주 시 자동으로 완주 기록 API 호출
  useEffect(() => {
    if (!isCompleted || !activeRoute || !isNavigating) return
    if (completionCalledRef.current) return
    completionCalledRef.current = true

    const startedAt = useCourseProgressStore.getState().startedAt
    const duration = startedAt
      ? Math.round((Date.now() - startedAt.getTime()) / 60000)
      : 0

    fetch(`/api/routes/${activeRoute.id}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkedSpotIds: Array.from(checkedSpotIds),
        duration,
      }),
    }).catch(() => {
      // 오프라인 시 무시
    })
  }, [isCompleted, activeRoute, isNavigating, checkedSpotIds])

  // 코스 종료 시 리셋
  const endRoute = useCallback(() => {
    completionCalledRef.current = false
    storeEndRoute()
    resetProgress()
  }, [storeEndRoute, resetProgress])

  // startRoute 래퍼: completionCalledRef 리셋
  const handleStartRoute = useCallback(
    async (route: Route, userId: string) => {
      completionCalledRef.current = false
      await startRoute(route, userId)
    },
    [startRoute]
  )

  return {
    activeRoute,
    currentSpotIndex,
    checkedSpotIds: Array.from(checkedSpotIds),
    progress,
    distanceToNext,
    estimatedTimeToNext,
    startRoute: handleStartRoute,
    checkInSpot,
    moveToNextSpot,
    endRoute,
    isCompleted,
    isNavigating,
    currentPosition: geo.coordinates,
    accuracy: geo.accuracy,
  }
}
