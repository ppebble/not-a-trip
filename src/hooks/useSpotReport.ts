import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES } from '@/lib/api-routes'
import type { CreateSpotReportInput, SpotReport } from '@/types/report'

/** 제보 생성 응답 */
interface CreateReportResponse {
  id: string
  message: string
}

/** 제보 수정 응답 */
interface UpdateReportResponse {
  id: string
  message: string
}

/** 제보 목록 쿼리 키 */
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
  nearby: (lat: number, lng: number) =>
    [...reportKeys.all, 'nearby', lat, lng] as const,
}

/**
 * 신규 성지 제보 제출 훅
 * POST /api/reports
 * Requirements: 1.2, 1.4
 */
export function useCreateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CreateSpotReportInput
    ): Promise<CreateReportResponse> => {
      const response = await fetch(API_ROUTES.REPORTS.BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제보 생성에 실패했습니다')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
    },
  })
}

/**
 * 제보 수정 훅 (수정요청 상태 대응)
 * PUT /api/reports/:id
 * Requirements: 1.6
 */
export function useUpdateReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: CreateSpotReportInput
    }): Promise<UpdateReportResponse> => {
      const response = await fetch(API_ROUTES.REPORTS.DETAIL(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제보 수정에 실패했습니다')
      }

      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: reportKeys.detail(variables.id),
      })
    },
  })
}

/**
 * 제보 상세 조회 훅
 * GET /api/reports/:id
 */
export function useReportDetail(reportId: string | null) {
  return useQuery({
    queryKey: reportKeys.detail(reportId || ''),
    queryFn: async (): Promise<SpotReport> => {
      if (!reportId) throw new Error('Report ID is required')

      const response = await fetch(API_ROUTES.REPORTS.DETAIL(reportId))
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제보 조회에 실패했습니다')
      }
      return response.json()
    },
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  })
}
