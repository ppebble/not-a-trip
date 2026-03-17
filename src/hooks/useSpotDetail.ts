import { useCallback } from 'react'
import {
  useQuery,
  useSuspenseQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { spotKeys, SpotDetailData } from './useSpots'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import { NearbyFacility, FacilityType } from '@/types'

/**
 * Hook to fetch detailed spot information
 * Used for spot detail pages and comprehensive spot data
 */
export function useSpotDetail(spotId: string | null) {
  return useQuery({
    queryKey: spotKeys.detail(spotId || ''),
    queryFn: async (): Promise<SpotDetailData> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(API_ROUTES.SPOTS.DETAIL(spotId))

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot detail: ${response.status} ${response.statusText}`
        )
      }

      // API returns SpotResponse directly (not wrapped in { spot: ... })
      const data: SpotDetailData = await response.json()
      return data
    },
    enabled: !!spotId,
    staleTime: 10 * 60 * 1000, // 10 minutes for detailed spot data
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
  })
}

/** 편의시설 쿼리 키 팩토리 */
const facilityKeys = {
  base: (spotId: string) => [...spotKeys.detail(spotId), 'facilities'] as const,
  filtered: (spotId: string, type?: FacilityType) =>
    [...facilityKeys.base(spotId), { type }] as const,
}

/**
 * Hook to fetch nearby facilities for a specific spot
 * @param spotId - 스팟 ID
 * @param type - 카테고리 필터 (선택) — Requirements 1.3, 1.4, 7.1
 */
export function useNearbyFacilities(
  spotId: string | null,
  type?: FacilityType
) {
  return useQuery({
    queryKey: facilityKeys.filtered(spotId || '', type),
    queryFn: async (): Promise<NearbyFacility[]> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const url = buildUrl(API_ROUTES.SPOTS.FACILITIES(spotId), {
        type: type || undefined,
      })
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch nearby facilities: ${response.status} ${response.statusText}`
        )
      }

      const data: NearbyFacility[] = await response.json()
      return data
    },
    enabled: !!spotId,
    staleTime: 15 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  })
}

/**
 * Suspense 모드 스팟 상세 훅
 * AsyncBoundary 내부에서 사용 — 로딩/에러 상태를 Suspense/ErrorBoundary로 위임
 * Requirements: 2.3, 2.5
 */
export function useSpotDetailSuspense(spotId: string) {
  return useSuspenseQuery({
    queryKey: spotKeys.detail(spotId),
    queryFn: async (): Promise<SpotDetailData> => {
      const response = await fetch(API_ROUTES.SPOTS.DETAIL(spotId))

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot detail: ${response.status} ${response.statusText}`
        )
      }

      const data: SpotDetailData = await response.json()
      return data
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

/** 투표 API 응답 */
interface VoteResult {
  verificationScore: number
  upvotes: number
  downvotes: number
}

/**
 * 편의시설 투표 함수를 반환하는 훅
 * 투표 후 해당 스팟의 편의시설 캐시를 자동 갱신합니다.
 * Requirements: 7.6
 */
export function useFacilityVote(spotId: string | null) {
  const queryClient = useQueryClient()

  const vote = useCallback(
    async (facilityId: string, value: boolean): Promise<VoteResult> => {
      const res = await fetch(API_ROUTES.FACILITIES.VOTE(facilityId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (!res.ok) {
        throw new Error('투표에 실패했습니다')
      }

      const result: VoteResult = await res.json()

      // 투표 후 편의시설 목록 캐시 갱신
      if (spotId) {
        queryClient.invalidateQueries({
          queryKey: facilityKeys.base(spotId),
        })
      }

      return result
    },
    [spotId, queryClient]
  )

  return { vote }
}

/**
 * 편의시설 목록 캐시를 수동으로 갱신하는 훅
 * 제보 완료 후 목록 갱신에 사용합니다.
 * Requirements: 5.1
 */
export function useInvalidateFacilities(spotId: string | null) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    if (spotId) {
      queryClient.invalidateQueries({
        queryKey: facilityKeys.base(spotId),
      })
    }
  }, [spotId, queryClient])

  return { invalidate }
}
