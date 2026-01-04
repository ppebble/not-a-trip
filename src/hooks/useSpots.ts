import { useQuery } from '@tanstack/react-query'

// Types for spot data
export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
}

export interface SpotPreviewData {
  id: string
  name: string
  description: string
  photoUrl: string
  address: string
}

export interface MediaInfo {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  year?: number
}

export interface SpotDetailData {
  id: string
  name: string
  description: string
  photos: string[]
  address: string
  coordinates: [number, number]
  relatedMedia: MediaInfo[]
}

// API response types
interface SpotsResponse {
  spots: SpotPin[]
  total: number
}

interface SpotResponse {
  spot: SpotDetailData
}

// Query keys
export const spotKeys = {
  all: ['spots'] as const,
  lists: () => [...spotKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...spotKeys.lists(), { filters }] as const,
  details: () => [...spotKeys.all, 'detail'] as const,
  detail: (id: string) => [...spotKeys.details(), id] as const,
}

/**
 * Hook to fetch all spots for map pins
 */
export function useSpots() {
  return useQuery({
    queryKey: spotKeys.lists(),
    queryFn: async (): Promise<SpotPin[]> => {
      const response = await fetch('/api/spots')

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spots: ${response.status} ${response.statusText}`
        )
      }

      const data: SpotsResponse = await response.json()
      return data.spots
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to fetch spot preview data
 * Used for popups and quick previews
 */
export function useSpotPreview(spotId: string | null) {
  return useQuery({
    queryKey: spotKeys.detail(spotId || ''),
    queryFn: async (): Promise<SpotPreviewData> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(`/api/spots/${spotId}`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot: ${response.status} ${response.statusText}`
        )
      }

      // API returns SpotResponse directly (not wrapped in { spot: ... })
      const spot: SpotDetailData = await response.json()

      // Transform to preview format
      return {
        id: spot.id,
        name: spot.name,
        description: spot.description,
        photoUrl: spot.photos[0] || '', // Use first photo as thumbnail
        address: spot.address,
      }
    },
    enabled: !!spotId,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual spots
  })
}
