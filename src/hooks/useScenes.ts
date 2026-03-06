import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scene, CreateSceneInput, UserLikeStatus } from '@/types'
import { getDeviceId } from '@/lib/device-id'
import { API_ROUTES } from '@/lib/api-routes'

// API response type
interface ScenesResponse {
  scenes: Scene[]
  total: number
}

// Like toggle response type
interface LikeToggleResponse {
  success: boolean
  liked: boolean
  likeCount: number
}

// Query keys
export const sceneKeys = {
  all: ['scenes'] as const,
  bySpot: (spotId: string) => [...sceneKeys.all, 'spot', spotId] as const,
  likeStatus: (sceneId: string) => [...sceneKeys.all, 'like', sceneId] as const,
}

/**
 * deviceId 헤더 생성 (Content-Type 없음)
 */
function getDeviceIdHeaders(): HeadersInit {
  const deviceId = getDeviceId()
  if (!deviceId) return {}
  return { 'X-Device-Id': deviceId }
}

/**
 * deviceId 헤더를 포함한 fetch 옵션 생성
 */
function getHeadersWithDeviceId(): HeadersInit {
  const deviceId = getDeviceId()
  if (!deviceId) {
    return { 'Content-Type': 'application/json' }
  }
  return {
    'Content-Type': 'application/json',
    'X-Device-Id': deviceId,
  }
}

/**
 * Hook to fetch scenes for a specific spot
 */
export function useScenesBySpot(spotId: string | null) {
  return useQuery({
    queryKey: sceneKeys.bySpot(spotId || ''),
    queryFn: async (): Promise<Scene[]> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(API_ROUTES.SPOTS.SCENES(spotId))

      if (!response.ok) {
        throw new Error(
          `Failed to fetch scenes: ${response.status} ${response.statusText}`
        )
      }

      const data: ScenesResponse = await response.json()

      return data.scenes.map((scene) => ({
        ...scene,
        createdAt: new Date(scene.createdAt),
      }))
    },
    enabled: !!spotId,
  })
}

/**
 * Hook to get like status for a specific scene
 */
export function useLikeStatus(sceneId: string | null) {
  return useQuery({
    queryKey: sceneKeys.likeStatus(sceneId || ''),
    queryFn: async (): Promise<UserLikeStatus> => {
      if (!sceneId) {
        throw new Error('Scene ID is required')
      }

      const response = await fetch(API_ROUTES.SCENES.LIKE(sceneId), {
        headers: getDeviceIdHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch like status')
      }

      return response.json()
    },
    enabled: !!sceneId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to create a new scene
 */
export function useCreateScene() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSceneInput): Promise<Scene> => {
      const response = await fetch(API_ROUTES.SPOTS.SCENES(input.spotId), {
        method: 'POST',
        headers: getHeadersWithDeviceId(),
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create scene')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      // Invalidate scenes for this spot
      queryClient.invalidateQueries({
        queryKey: sceneKeys.bySpot(variables.spotId),
      })
    },
  })
}

/**
 * Hook to toggle like on a scene
 * 로그인/비로그인 모두 토글 방식으로 동작
 */
export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId: string): Promise<LikeToggleResponse> => {
      const response = await fetch(API_ROUTES.SCENES.LIKE(sceneId), {
        method: 'POST',
        headers: getDeviceIdHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      return response.json()
    },
    onSuccess: (data, sceneId) => {
      // 좋아요 상태 캐시 업데이트
      queryClient.setQueryData(sceneKeys.likeStatus(sceneId), {
        liked: data.liked,
        likeCount: data.likeCount,
      })
    },
  })
}

/**
 * Hook to like a scene (legacy - for compatibility)
 */
export function useLikeScene() {
  return useToggleLike()
}

/**
 * Hook to unlike a scene
 */
export function useUnlikeScene() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId: string): Promise<LikeToggleResponse> => {
      const response = await fetch(API_ROUTES.SCENES.LIKE(sceneId), {
        method: 'DELETE',
        headers: getDeviceIdHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to unlike scene')
      }

      return response.json()
    },
    onSuccess: (data, sceneId) => {
      // 좋아요 상태 캐시 업데이트
      queryClient.setQueryData(sceneKeys.likeStatus(sceneId), {
        liked: data.liked,
        likeCount: data.likeCount,
      })
    },
  })
}

/**
 * 여러 장면의 좋아요 상태를 일괄 조회하는 함수
 */
export async function fetchLikeStatuses(
  sceneIds: string[]
): Promise<Map<string, boolean>> {
  const headers = getDeviceIdHeaders()
  const results = new Map<string, boolean>()

  await Promise.all(
    sceneIds.map(async (sceneId) => {
      try {
        const response = await fetch(API_ROUTES.SCENES.LIKE(sceneId), {
          headers,
        })
        if (response.ok) {
          const data = await response.json()
          results.set(sceneId, data.liked)
        } else {
          results.set(sceneId, false)
        }
      } catch {
        results.set(sceneId, false)
      }
    })
  )

  return results
}
