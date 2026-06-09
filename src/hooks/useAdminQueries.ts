import { useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type {
  DashboardSummaryResponse,
  SpotReport,
  SpotStatusReport,
  SpotSupplement,
} from '@/types/report'
import type {
  CreateSupplementRequestInput,
  ReportProcessingStatus,
  SpotQualityReport,
  SupplementRequest,
} from '@/types/spot-quality'

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

export type AdminQualityReport = SpotQualityReport & {
  nearingDeadline?: boolean
}

interface AdminQualityReportsResponse {
  reports: AdminQualityReport[]
  total: number
}

interface AdminSupplementRequestsResponse {
  requests: SupplementRequest[]
  total: number
}

export interface ReviewQualityReportInput {
  id: string
  action: 'approved' | 'rejected' | 'deferred'
  reason: string
  closeSpot?: boolean
}

export interface CreateAdminSupplementRequestInput {
  spotId: string
  requestType: CreateSupplementRequestInput['requestType']
  content: string
  deadline: string
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

export interface AdminMediaScene {
  id?: string
  spotId?: string
  imageUrl: string
  animeTitle?: string
  episodeInfo?: string
  description?: string
  likeCount?: number
}

export interface AdminSpotMediaResponse {
  spot: {
    id: string
    name: string
    photos: string[]
  }
  scenes: AdminMediaScene[]
}

export interface UpdateAdminSpotMediaInput {
  spotId: string
  photos: string[]
  scenes: AdminMediaScene[]
}

// ── Query Key Factory ───────────────────────────────────────

export const adminKeys = {
  all: ['admin'] as const,
  dashboard: () => [...adminKeys.all, 'dashboard'] as const,
  dashboardSummary: () => [...adminKeys.dashboard(), 'summary'] as const,
  reports: () => [...adminKeys.all, 'reports'] as const,
  reportList: (statusFilter: string, page: number) =>
    [...adminKeys.reports(), { statusFilter, page }] as const,
  qualityReports: () => [...adminKeys.all, 'qualityReports'] as const,
  qualityReportList: (
    statusFilter: string,
    urgentOnly: boolean,
    spotId: string
  ) =>
    [
      ...adminKeys.qualityReports(),
      { statusFilter, urgentOnly, spotId },
    ] as const,
  supplementRequests: (spotId: string) =>
    [...adminKeys.all, 'supplementRequests', spotId] as const,
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
  media: () => [...adminKeys.all, 'media'] as const,
  spotMedia: (spotId: string) => [...adminKeys.media(), spotId] as const,
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * 관리자 대시보드 요약 데이터 조회 훅
 * Requirements: 5.1, 5.2
 */
export function useAdminDashboardSummary(enabled = true) {
  return useQuery({
    queryKey: adminKeys.dashboardSummary(),
    enabled,
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

export function useAdminSpotMedia(spotId: string) {
  return useQuery({
    queryKey: adminKeys.spotMedia(spotId),
    enabled: Boolean(spotId.trim()),
    queryFn: async (): Promise<AdminSpotMediaResponse> => {
      const res = await fetch(
        '/api/admin/media/' + encodeURIComponent(spotId.trim())
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '스팟 미디어 조회 실패')
      }
      return data
    },
  })
}

export function useUpdateAdminSpotMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      spotId,
      photos,
      scenes,
    }: UpdateAdminSpotMediaInput) => {
      const res = await fetch(
        '/api/admin/media/' + encodeURIComponent(spotId.trim()),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photos, scenes }),
        }
      )
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '스팟 미디어 저장 실패')
      }
      return data as { success: true }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: adminKeys.spotMedia(variables.spotId) })
    },
  })
}

/** Admin quality report list query */
export function useAdminQualityReports(
  statusFilter: ReportProcessingStatus | 'open' | 'all',
  urgentOnly: boolean,
  spotId = ''
) {
  return useQuery({
    queryKey: adminKeys.qualityReportList(statusFilter, urgentOnly, spotId),
    queryFn: async (): Promise<AdminQualityReportsResponse> => {
      const url = buildUrl(API_ROUTES.ADMIN.QUALITY_REPORTS, {
        status: statusFilter === 'all' ? undefined : statusFilter,
        urgentOnly: urgentOnly ? 'true' : undefined,
        spotId: spotId || undefined,
      })
      const res = await fetch(url)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch quality reports')
      }
      return res.json()
    },
  })
}

/** Admin supplement request list query */
export function useAdminSupplementRequests(spotId?: string) {
  return useQuery({
    queryKey: adminKeys.supplementRequests(spotId ?? ''),
    enabled: Boolean(spotId),
    queryFn: async (): Promise<AdminSupplementRequestsResponse> => {
      if (!spotId) return { requests: [], total: 0 }
      const res = await fetch(API_ROUTES.SUPPLEMENTS.REQUESTS(spotId))
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch supplement requests')
      }
      return res.json()
    },
  })
}

/** Review quality report mutation */
export function useReviewQualityReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...body }: ReviewQualityReportInput) => {
      const res = await fetch(API_ROUTES.ADMIN.QUALITY_REPORT_REVIEW(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to review quality report')
      }
      return data as { message: string; report: AdminQualityReport }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.qualityReports() })
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() })
    },
  })
}

/** Create admin supplement request mutation */
export function useCreateAdminSupplementRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      spotId,
      ...body
    }: CreateAdminSupplementRequestInput) => {
      const res = await fetch(API_ROUTES.SUPPLEMENTS.REQUESTS(spotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create supplement request')
      }
      return data as { id: string; request: SupplementRequest }
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: adminKeys.supplementRequests(variables.spotId),
      })
      qc.invalidateQueries({ queryKey: adminKeys.qualityReports() })
      qc.invalidateQueries({ queryKey: adminKeys.dashboard() })
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

/** Invalidate quality report caches */
export function useInvalidateAdminQualityReports() {
  const qc = useQueryClient()
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: adminKeys.qualityReports() })
    qc.invalidateQueries({ queryKey: adminKeys.dashboard() })
  }, [qc])
}
