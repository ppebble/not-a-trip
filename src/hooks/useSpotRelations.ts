import { useQuery } from '@tanstack/react-query'
import { SpotContentRelation } from '@/types'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'

// API response types
interface RelationsResponse {
  relations: SpotContentRelation[]
  total: number
}

interface ByContentResponse {
  spotIds: string[]
  total: number
}

// Query key factory
export const spotRelationKeys = {
  all: ['spot-relations'] as const,
  lists: () => [...spotRelationKeys.all, 'list'] as const,
  list: (spotId: string) => [...spotRelationKeys.lists(), spotId] as const,
  byContent: () => [...spotRelationKeys.all, 'by-content'] as const,
  byContentName: (contentName: string) =>
    [...spotRelationKeys.byContent(), contentName] as const,
}

/**
 * 스팟별 관계 목록을 조회하는 훅
 * GET /api/spots/[id]/relations 호출
 * Requirements: 4.1
 */
export function useSpotRelations(spotId: string) {
  return useQuery({
    queryKey: spotRelationKeys.list(spotId),
    queryFn: async (): Promise<RelationsResponse> => {
      const response = await fetch(API_ROUTES.SPOTS.RELATIONS(spotId))

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot relations: ${response.status} ${response.statusText}`
        )
      }

      const data: RelationsResponse = await response.json()
      return data
    },
    enabled: !!spotId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}

/**
 * 작품별 스팟 목록을 조회하는 훅
 * GET /api/spots/relations/by-content?contentName=... 호출
 * Requirements: 6.1, 6.4
 */
export function useSpotsByContent(contentName: string) {
  return useQuery({
    queryKey: spotRelationKeys.byContentName(contentName),
    queryFn: async (): Promise<ByContentResponse> => {
      const url = buildUrl(API_ROUTES.SPOTS.BY_CONTENT, { contentName })
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spots by content: ${response.status} ${response.statusText}`
        )
      }

      const data: ByContentResponse = await response.json()
      return data
    },
    enabled: !!contentName,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}
