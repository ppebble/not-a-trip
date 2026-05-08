import { useQuery } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type { UserStats, UserBadge, ContentProgress } from '@/types'

// ── Response Types ──────────────────────────────────────────

export interface UserInfo {
  id: string
  name: string
  image: string | null
  createdAt: string
}

interface BadgesResponse {
  badges: UserBadge[]
}

interface ProgressResponse {
  progress: ContentProgress[]
}

interface ReportedSpot {
  id: string
  name: string
  address: string
}

// ── Query Key Factory ───────────────────────────────────────

export const userKeys = {
  all: ['users'] as const,
  info: (userId: string) => [...userKeys.all, 'info', userId] as const,
  stats: (userId: string) => [...userKeys.all, 'stats', userId] as const,
  badges: (userId: string) => [...userKeys.all, 'badges', userId] as const,
  progress: (userId: string) => [...userKeys.all, 'progress', userId] as const,
  reportedSpots: (userId: string) =>
    [...userKeys.all, 'reportedSpots', userId] as const,
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * 유저 기본 정보 조회 훅
 * Requirements: 2.1, 2.2, 2.3, 2.4, 5.2
 */
export function useUserInfo(userId: string | undefined) {
  return useQuery({
    queryKey: userKeys.info(userId!),
    queryFn: async (): Promise<UserInfo> => {
      const res = await fetch(API_ROUTES.USERS.INFO(userId!))
      if (!res.ok) throw new Error('유저 정보 조회 실패')
      return res.json()
    },
    enabled: !!userId,
  })
}

/**
 * 유저 통계 조회 훅
 * Requirements: 8.3
 */
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: userKeys.stats(userId),
    queryFn: async (): Promise<UserStats> => {
      const res = await fetch(API_ROUTES.USERS.STATS(userId))
      if (!res.ok) throw new Error('유저 통계 조회 실패')
      return res.json()
    },
    enabled: !!userId,
  })
}

/**
 * 유저 뱃지 조회 훅
 * Requirements: 8.3
 */
export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: userKeys.badges(userId),
    queryFn: async (): Promise<UserBadge[]> => {
      const res = await fetch(API_ROUTES.USERS.BADGES(userId))
      if (!res.ok) throw new Error('유저 뱃지 조회 실패')
      const data: BadgesResponse = await res.json()
      return data.badges
    },
    enabled: !!userId,
  })
}

/**
 * 유저 콘텐츠 진행률 조회 훅
 * Requirements: 8.3
 */
export function useUserProgress(userId: string) {
  return useQuery({
    queryKey: userKeys.progress(userId),
    queryFn: async (): Promise<ContentProgress[]> => {
      const res = await fetch(API_ROUTES.USERS.PROGRESS(userId))
      if (!res.ok) throw new Error('유저 진행률 조회 실패')
      const data: ProgressResponse = await res.json()
      return data.progress
    },
    enabled: !!userId,
  })
}

/**
 * 유저가 제보한 스팟 목록 조회 훅
 * Requirements: 8.3
 */
export function useUserReportedSpots(userId: string) {
  return useQuery({
    queryKey: userKeys.reportedSpots(userId),
    queryFn: async (): Promise<ReportedSpot[]> => {
      const url = buildUrl(API_ROUTES.SPOTS.BASE, {
        firstReporterId: userId,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('제보 스팟 조회 실패')
      const data = await res.json()
      return (data.spots || []).map(
        (s: { id: string; name: string; address?: string }) => ({
          id: s.id,
          name: s.name,
          address: s.address || '',
        })
      )
    },
    enabled: !!userId,
  })
}
