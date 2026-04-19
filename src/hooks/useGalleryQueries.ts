import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type { CheckIn } from '@/types'

// ── Response Types ──────────────────────────────────────────

interface CheckInsResponse {
  checkins: CheckIn[]
  total: number
  page: number
  limit: number
}

interface SpotRankingItem {
  spotId: string
  spotName: string
  thumbnailUrl: string
  checkInCount: number
}

interface CheckInRankingItem {
  checkInId: string
  photoUrl: string
  userName: string
  likeCount: number
  spotName: string
}

interface RankingResponse {
  spotRanking: SpotRankingItem[]
  checkInRanking: CheckInRankingItem[]
  period: { start: string; end: string }
}

interface ContentNameItem {
  name: string
  count: number
  contentType?: string
}

interface ContentNamesResponse {
  items: ContentNameItem[]
  total: number
}

// ── Query Key Factory ───────────────────────────────────────

export const galleryKeys = {
  all: ['gallery'] as const,
  checkins: () => [...galleryKeys.all, 'checkins'] as const,
  checkinList: (params: Record<string, unknown>) =>
    [...galleryKeys.checkins(), params] as const,
  ranking: () => [...galleryKeys.all, 'ranking'] as const,
  contentList: (contentType?: string) =>
    [...galleryKeys.all, 'contentList', contentType ?? 'all'] as const,
  checkinCount: (spotId: string) =>
    [...galleryKeys.all, 'checkinCount', spotId] as const,
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * 인증샷 갤러리 조회 훅
 * Requirements: 8.3
 */
export function useCheckInGallery(
  spotId?: string,
  userId?: string,
  sortBy: 'latest' | 'popular' = 'latest',
  page: number = 1,
  limit: number = 12
) {
  return useQuery({
    queryKey: galleryKeys.checkinList({ spotId, userId, sortBy, page, limit }),
    queryFn: async (): Promise<CheckInsResponse> => {
      const url = buildUrl(API_ROUTES.CHECKINS.BASE, {
        spotId,
        userId,
        sortBy,
        page,
        limit,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('인증샷 조회 실패')
      return res.json()
    },
  })
}

/**
 * 명예의 전당 랭킹 조회 훅
 * Requirements: 8.3
 */
export function useHallOfFameRanking() {
  return useQuery({
    queryKey: galleryKeys.ranking(),
    queryFn: async (): Promise<RankingResponse> => {
      const res = await fetch(API_ROUTES.CHECKINS.RANKING)
      if (!res.ok) throw new Error('랭킹 데이터 조회 실패')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 콘텐츠 목록 조회 훅 (ContentTab용)
 * Requirements: 8.3
 */
export function useContentList(contentType?: string) {
  return useQuery({
    queryKey: galleryKeys.contentList(contentType),
    queryFn: async (): Promise<ContentNamesResponse> => {
      const params: Record<string, string> = { type: 'content' }
      if (contentType && contentType !== 'all') {
        params.contentType = contentType
      }
      const res = await fetch(buildUrl(API_ROUTES.CONTENT_NAMES, params))
      if (!res.ok) throw new Error('콘텐츠 목록 조회 실패')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * 스팟별 인증 수 조회 훅 (SpotCheckInSection용)
 * Requirements: 8.3
 */
export function useCheckInCount(spotId: string) {
  return useQuery({
    queryKey: galleryKeys.checkinCount(spotId),
    queryFn: async (): Promise<number> => {
      const url = buildUrl(API_ROUTES.CHECKINS.BASE, {
        spotId,
        limit: 1,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('인증 수 조회 실패')
      const data = await res.json()
      return data.total
    },
    enabled: !!spotId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// ── Invalidation Hooks ──────────────────────────────────────

/** 인증샷 갤러리 캐시 무효화 */
export function useInvalidateCheckIns() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: galleryKeys.checkins() })
    qc.invalidateQueries({ queryKey: galleryKeys.ranking() })
  }, [qc])
}

/** 특정 스팟 인증 수 캐시 무효화 */
export function useInvalidateCheckInCount(spotId: string) {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: galleryKeys.checkinCount(spotId) })
  }, [qc, spotId])
}

// ── Contributor Types ───────────────────────────────────────

interface Contributor {
  contributorId: string
  contributorName: string
  count: number
}

// ── Contributor Query Keys ──────────────────────────────────

export const contributorKeys = {
  all: ['contributors'] as const,
  list: (spotId: string) => [...contributorKeys.all, spotId] as const,
}

/**
 * 스팟 정보 보완 기여자 목록 조회 훅
 * Requirements: 8.3
 */
export function useContributors(spotId: string) {
  return useQuery({
    queryKey: contributorKeys.list(spotId),
    queryFn: async (): Promise<Contributor[]> => {
      const res = await fetch(API_ROUTES.SUPPLEMENTS.BASE(spotId))
      if (!res.ok) throw new Error('기여자 목록 조회 실패')
      const data = await res.json()
      return data.contributors || []
    },
    enabled: !!spotId,
    staleTime: 5 * 60 * 1000,
  })
}
