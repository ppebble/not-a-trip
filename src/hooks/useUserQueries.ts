import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type {
  UserStats,
  UserBadge,
  ContentProgress,
  UserRoute,
  UserBookmark,
  UserCompletion,
  UserReport,
  UserSupplement,
  UserStatusReport,
  UserPost,
  UserComment,
} from '@/types'

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
  routes: (userId: string) => [...userKeys.all, 'routes', userId] as const,
  bookmarks: (userId: string) =>
    [...userKeys.all, 'bookmarks', userId] as const,
  completions: (userId: string) =>
    [...userKeys.all, 'completions', userId] as const,
  reports: (userId: string) => [...userKeys.all, 'reports', userId] as const,
  supplements: (userId: string) =>
    [...userKeys.all, 'supplements', userId] as const,
  statusReports: (userId: string) =>
    [...userKeys.all, 'statusReports', userId] as const,
  posts: (userId: string) => [...userKeys.all, 'posts', userId] as const,
  comments: (userId: string) => [...userKeys.all, 'comments', userId] as const,
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

/**
 * 유저가 만든 코스 목록 조회 훅
 * Requirements: 9.1
 */
export function useUserRoutes(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.routes(userId),
    queryFn: async (): Promise<UserRoute[]> => {
      const res = await fetch(API_ROUTES.USERS.ROUTES(userId))
      if (!res.ok) throw new Error('코스 목록 조회 실패')
      const data = await res.json()
      return data.routes
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저가 저장한 코스 목록 조회 훅
 * Requirements: 9.2
 */
export function useUserBookmarks(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.bookmarks(userId),
    queryFn: async (): Promise<UserBookmark[]> => {
      const res = await fetch(API_ROUTES.USERS.BOOKMARKS(userId))
      if (!res.ok) throw new Error('저장한 코스 조회 실패')
      const data = await res.json()
      return data.bookmarks
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 코스 완주 기록 조회 훅
 * Requirements: 9.3
 */
export function useUserCompletions(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.completions(userId),
    queryFn: async (): Promise<UserCompletion[]> => {
      const res = await fetch(API_ROUTES.USERS.COMPLETIONS(userId))
      if (!res.ok) throw new Error('완주 기록 조회 실패')
      const data = await res.json()
      return data.completions
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 신규 스팟 제보 목록 조회 훅
 * Requirements: 9.4
 */
export function useUserReports(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.reports(userId),
    queryFn: async (): Promise<UserReport[]> => {
      const res = await fetch(API_ROUTES.USERS.REPORTS(userId))
      if (!res.ok) throw new Error('제보 목록 조회 실패')
      const data = await res.json()
      return data.reports
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 정보보완 신청 목록 조회 훅
 * Requirements: 9.5
 */
export function useUserSupplements(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.supplements(userId),
    queryFn: async (): Promise<UserSupplement[]> => {
      const res = await fetch(API_ROUTES.USERS.SUPPLEMENTS(userId))
      if (!res.ok) throw new Error('정보보완 목록 조회 실패')
      const data = await res.json()
      return data.supplements
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 상태신고 목록 조회 훅
 * Requirements: 9.6
 */
export function useUserStatusReports(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.statusReports(userId),
    queryFn: async (): Promise<UserStatusReport[]> => {
      const res = await fetch(API_ROUTES.USERS.STATUS_REPORTS(userId))
      if (!res.ok) throw new Error('상태신고 목록 조회 실패')
      const data = await res.json()
      return data.statusReports
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 게시글 목록 조회 훅
 * Requirements: 9.7
 */
export function useUserPosts(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.posts(userId),
    queryFn: async (): Promise<UserPost[]> => {
      const res = await fetch(API_ROUTES.USERS.POSTS(userId))
      if (!res.ok) throw new Error('게시글 목록 조회 실패')
      const data = await res.json()
      return data.posts
    },
    enabled: !!userId && enabled,
  })
}

/**
 * 유저의 댓글 목록 조회 훅
 * Requirements: 9.8
 */
export function useUserComments(userId: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.comments(userId),
    queryFn: async (): Promise<UserComment[]> => {
      const res = await fetch(API_ROUTES.USERS.COMMENTS(userId))
      if (!res.ok) throw new Error('댓글 목록 조회 실패')
      const data = await res.json()
      return data.comments
    },
    enabled: !!userId && enabled,
  })
}
