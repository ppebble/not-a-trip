import { useQuery } from '@tanstack/react-query'
import { spotKeys, SpotDetailData } from './useSpots'

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

      const response = await fetch(`/api/spots/${spotId}`)

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

/**
 * Hook to fetch nearby facilities for a specific spot
 */
export interface NearbyFacility {
  id: string
  name: string
  type: FacilityType
  distance: number // meters
  address: string
  coordinates: [number, number]
}

export type FacilityType =
  | 'restaurant'
  | 'convenience_store'
  | 'cafe'
  | 'station'
  | 'other'

interface NearbyFacilitiesResponse {
  facilities: NearbyFacility[]
  total: number
}

export function useNearbyFacilities(spotId: string | null) {
  return useQuery({
    queryKey: [...spotKeys.detail(spotId || ''), 'facilities'],
    queryFn: async (): Promise<NearbyFacility[]> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(`/api/spots/${spotId}/facilities`)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch nearby facilities: ${response.status} ${response.statusText}`
        )
      }

      const data: NearbyFacilitiesResponse = await response.json()
      return data.facilities
    },
    enabled: !!spotId,
    staleTime: 15 * 60 * 1000, // 15 minutes for facility data (changes less frequently)
    gcTime: 20 * 60 * 1000, // 20 minutes cache time
  })
}
