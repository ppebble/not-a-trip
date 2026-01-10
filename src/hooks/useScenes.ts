import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Scene, CreateSceneInput } from '@/types'

// API response type
interface ScenesResponse {
  scenes: Scene[]
  total: number
}

// Query keys
export const sceneKeys = {
  all: ['scenes'] as const,
  bySpot: (spotId: string) => [...sceneKeys.all, 'spot', spotId] as const,
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

      const response = await fetch(`/api/spots/${spotId}/scenes`)

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to create a new scene
 */
export function useCreateScene() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateSceneInput): Promise<Scene> => {
      const response = await fetch(`/api/spots/${input.spotId}/scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
 * Hook to like a scene
 */
export function useLikeScene() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId: string): Promise<{ likeCount: number }> => {
      const response = await fetch(`/api/scenes/${sceneId}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to like scene')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate all scene queries to refetch with updated like counts
      queryClient.invalidateQueries({ queryKey: sceneKeys.all })
    },
  })
}

/**
 * Hook to unlike a scene
 */
export function useUnlikeScene() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sceneId: string): Promise<{ likeCount: number }> => {
      const response = await fetch(`/api/scenes/${sceneId}/like`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to unlike scene')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sceneKeys.all })
    },
  })
}
