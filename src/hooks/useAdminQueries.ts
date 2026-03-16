import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type {
  DashboardSummaryResponse,
  SpotReport,
  SpotStatusReport,
  SpotSupplement,
} from '@/types/report'

// ── Response Types ──────────────────────────────────────────

interface AdminReportsResponse {
  reports: SpotReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AdminStatusReportsResponse {
  reports: SpotStatusReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface AdminSupplementsResponse {
  supplements: SpotSupplement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

interface ContentMaster {
  id: string
  normalizedName: string
  displayName: string
  imageUrl?: string
  type?: string
  year?: number
  spotCount: number
  createdAt: string
  updatedAt: string
}

interface ContentMastersResponse {
  items: ContentMaster[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Query Key Factory ───────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  dashboardSummary: () => [...adminKeys.dashboard(), 'summary'] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
  reportList: (statusFilter: string, page: number) =>
    [...adminKeys.reports(), { statusFilter, page }] as const,
  statusReports: () => [...adminKeys.all, 'statusReports'] as const,
  statusReportList: (
    reviewStatusFilter: string,
    statusFilter: string,
    page: number
  ) =>
    [
      ...adminKeys.statusReports(),
      { reviewStatusFilter, statusFilter, page },
    ] as const,
  supplements: () => [...adminKeys.all, 'supplements'] as const,
  supplementList: (statusFilter: string, page: number) =>
    [...adminKeys.supplements(), { statusFilter, page }] as const,
  contentImages: () => [...adminKeys.all, 'contentImages'] as const,
  contentImageList: (search: string, page: number) =>
    [...adminKeys.contentImages(), { search, page }] as const,
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * 관리자 대시보드 요약 데이터 조회 훅
 * Requirements: 5.1, 5.2
 */
export function useAdminDashboardSummary() {
  return useQuery({
    queryKey: adminKeys.dashboardSummary(),
    queryFn: async (): Promise<DashboardSummaryResponse> => {
      const res = await fetch(API_ROUTES.ADMIN.DASHBOARD_SUMMARY)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '대시보드 요약 데이터 조회 실패')
      }
      return res.json()
    },
  })
}

/**
 * 관리자 제보 목록 조회 훅
 * Requirements: 8.3
 */
export function useAdminReports(statusFilter: string, page: number) {
  return useQuery({
    queryKey: adminKeys.reportList(statusFilter, page),
    queryFn: async (): Promise<AdminReportsResponse> => {
      const url = buildUrl(API_ROUTES.ADMIN.REPORTS, {
        status: statusFilter,
        page,
        limit: 20,
      })
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '제보 목록 조회 실패')
      }
      return res.json()
    },
  })
}

/**
 * 관리자 상태 신고 목록 조회 훅
 * Requirements: 8.3
 */
export function useAdminStatusReports(
  reviewStatusFilter: string,
  statusFilter: string,
  page: number
) {
  return useQuery({
    queryKey: adminKeys.statusReportList(
      reviewStatusFilter,
      statusFilter,
      page
    ),
    queryFn: async (): Promise<AdminStatusReportsResponse> => {
      const url = buildUrl(API_ROUTES.ADMIN.STATUS_REPORTS, {
        reviewStatus: reviewStatusFilter,
        status: statusFilter,
        page,
        limit: 20,
      })
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '상태 신고 목록 조회 실패')
      }
      return res.json()
    },
  })
}

/**
 * 관리자 정보 보완 목록 조회 훅
 * Requirements: 8.3
 */
export function useAdminSupplements(statusFilter: string, page: number) {
  return useQuery({
    queryKey: adminKeys.supplementList(statusFilter, page),
    queryFn: async (): Promise<AdminSupplementsResponse> => {
      const url = buildUrl(API_ROUTES.ADMIN.SUPPLEMENTS, {
        status: statusFilter,
        page,
        limit: 20,
      })
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '정보 보완 목록 조회 실패')
      }
      return res.json()
    },
  })
}

/**
 * 관리자 콘텐츠 이미지 목록 조회 훅
 * Requirements: 8.3
 */
export function useAdminContentImages(search: string, page: number) {
  return useQuery({
    queryKey: adminKeys.contentImageList(search, page),
    queryFn: async (): Promise<ContentMastersResponse> => {
      const url = buildUrl(API_ROUTES.ADMIN.CONTENT_IMAGES, {
        search: search || undefined,
        page,
        limit: 20,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('콘텐츠 이미지 목록 조회 실패')
      return res.json()
    },
  })
}

// ── Invalidation Hooks ──────────────────────────────────────

/** 대시보드 요약 캐시 무효화 */
export function useInvalidateAdminDashboard() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.dashboard() })
  }, [qc])
}

/** 제보 목록 캐시 무효화 */
export function useInvalidateAdminReports() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.reports() })
  }, [qc])
}

/** 상태 신고 목록 캐시 무효화 */
export function useInvalidateAdminStatusReports() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.statusReports() })
  }, [qc])
}

/** 정보 보완 목록 캐시 무효화 */
export function useInvalidateAdminSupplements() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.supplements() })
  }, [qc])
}

/** 콘텐츠 이미지 목록 캐시 무효화 */
export function useInvalidateAdminContentImages() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.contentImages() })
  }, [qc])
}
