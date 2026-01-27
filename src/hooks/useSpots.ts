import { useQuery } from '@tanstack/react-query'
import { SpotCategory, RelatedContent, ExternalLink } from '@/types'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'

// Types for spot data
export interface SpotPin {
  id: string
  name: string
  coordinates: [number, number]
  thumbnailUrl: string
  category?: SpotCategory
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
  category?: SpotCategory
  /** @deprecated relatedContent 사용 권장 */
  relatedMedia?: MediaInfo[]
  relatedContent?: RelatedContent[]
  externalLinks?: ExternalLink[]
  authorId?: string
  authorName?: string
  isGuestSpot?: boolean
}

// API response types
interface SpotsResponse {
  spots: SpotPin[]
  total: number
}

// Community summary type
export interface SpotCommunitySummary {
  id: string
  name: string
  thumbnailUrl: string
  postCount: number
}

// Media community summary type
export interface MediaCommunitySummary {
  title: string
  type: 'anime' | 'drama' | 'movie' | 'other'
  postCount: number
}

// API response types
interface SpotCommunitySummaryResponse {
  summaries: SpotCommunitySummary[]
  total: number
}

interface MediaCommunitySummaryResponse {
  summaries: MediaCommunitySummary[]
  total: number
}

// Query keys
export const spotKeys = {
  all: ['spots'] as const,
  lists: () => [...spotKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...spotKeys.lists(), { filters }] as const,
  previews: () => [...spotKeys.all, 'preview'] as const,
  preview: (id: string) => [...spotKeys.previews(), id] as const,
  details: () => [...spotKeys.all, 'detail'] as const,
  detail: (id: string) => [...spotKeys.details(), id] as const,
  communitySummary: () => [...spotKeys.all, 'community-summary'] as const,
}

export const mediaKeys = {
  all: ['media'] as const,
  communitySummary: () => [...mediaKeys.all, 'community-summary'] as const,
}

/**
 * Hook to fetch all spots for map pins
 * @param categories - 필터링할 카테고리 배열 (선택사항)
 */
export function useSpots(categories?: SpotCategory[]) {
  return useQuery({
    queryKey: spotKeys.list({ categories }),
    queryFn: async (): Promise<SpotPin[]> => {
      const url = buildUrl(API_ROUTES.SPOTS.BASE, {
        category: categories?.length ? categories.join(',') : undefined,
      })
      const response = await fetch(url)

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
    queryKey: spotKeys.preview(spotId || ''),
    queryFn: async (): Promise<SpotPreviewData> => {
      if (!spotId) {
        throw new Error('Spot ID is required')
      }

      const response = await fetch(API_ROUTES.SPOTS.DETAIL(spotId))

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot: ${response.status} ${response.statusText}`
        )
      }

      // API returns SpotDetailData directly (not wrapped)
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

/**
 * Hook to fetch spot community summary
 * Returns spots with their post counts for community overview
 * Requirements: 5.1, 3.1
 */
export function useSpotCommunitySummary() {
  return useQuery({
    queryKey: spotKeys.communitySummary(),
    queryFn: async (): Promise<SpotCommunitySummary[]> => {
      const response = await fetch(API_ROUTES.SPOTS.COMMUNITY_SUMMARY)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch spot community summary: ${response.status} ${response.statusText}`
        )
      }

      const data: SpotCommunitySummaryResponse = await response.json()
      return data.summaries
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (게시글 수는 자주 변경될 수 있음)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch media community summary
 * Returns media titles with their post counts for community overview
 * Requirements: 5.1
 */
export function useMediaCommunitySummary() {
  return useQuery({
    queryKey: mediaKeys.communitySummary(),
    queryFn: async (): Promise<MediaCommunitySummary[]> => {
      const response = await fetch(API_ROUTES.MEDIA.COMMUNITY_SUMMARY)

      if (!response.ok) {
        throw new Error(
          `Failed to fetch media community summary: ${response.status} ${response.statusText}`
        )
      }

      const data: MediaCommunitySummaryResponse = await response.json()
      return data.summaries
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (게시글 수는 자주 변경될 수 있음)
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}
