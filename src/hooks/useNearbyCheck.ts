import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import { reportKeys } from './useSpotReport'

/** 근처 스팟/제보 항목 */
export interface NearbyItem {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  category?: string
  thumbnailUrl?: string
  type: 'spot' | 'report'
  distance: number
}

/** 근처 검색 응답 */
interface NearbyResponse {
  nearby: NearbyItem[]
  highDuplicates: NearbyItem[]
  proximityWarnings: NearbyItem[]
  total: number
  radius: number
}

const DEBOUNCE_MS = 500

/**
 * 좌표 변경 시 50m 이내 기존 스팟/제보 검색 훅
 * 디바운스 처리로 과도한 API 호출 방지
 * Requirements: 1.3
 */
export function useNearbyCheck(
  coordinates: { lat: number; lng: number } | null
) {
  const [debouncedCoords, setDebouncedCoords] = useState(coordinates)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      setDebouncedCoords(coordinates)
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
    // coordinates 객체 참조가 아닌 lat/lng 값 변경 시에만 디바운스 재시작
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates?.lat, coordinates?.lng])

  const query = useQuery({
    queryKey: reportKeys.nearby(
      debouncedCoords?.lat ?? 0,
      debouncedCoords?.lng ?? 0
    ),
    queryFn: async (): Promise<NearbyResponse> => {
      if (!debouncedCoords) throw new Error('좌표가 필요합니다')

      const url = buildUrl(API_ROUTES.REPORTS.NEARBY, {
        lat: debouncedCoords.lat,
        lng: debouncedCoords.lng,
      })

      const response = await fetch(url)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '근처 검색에 실패했습니다')
      }
      return response.json()
    },
    enabled: !!debouncedCoords,
    staleTime: 30 * 1000,
  })

  return {
    ...query,
    nearbyItems: query.data?.nearby ?? [],
    highDuplicates: query.data?.highDuplicates ?? [],
    proximityWarnings: query.data?.proximityWarnings ?? [],
    hasNearby: (query.data?.nearby.length ?? 0) > 0,
  }
}
