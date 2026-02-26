import { useMutation, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES } from '@/lib/api-routes'
import type { CreateStatusReportInput } from '@/types/report'
import { spotKeys } from './useSpots'

/** 상태 신고 응답 */
interface StatusReportResponse {
  id: string
  message: string
  statusUpdated: boolean
}

/**
 * 스팟 상태 신고 훅
 * POST /api/spots/:id/status-reports
 * Requirements: 4.1
 */
export function useStatusReport(spotId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      input: CreateStatusReportInput
    ): Promise<StatusReportResponse> => {
      const response = await fetch(API_ROUTES.STATUS_REPORTS.BASE(spotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '상태 신고에 실패했습니다')
      }

      return response.json()
    },
    onSuccess: () => {
      // 스팟 상세 데이터 갱신 (상태가 변경되었을 수 있음)
      queryClient.invalidateQueries({ queryKey: spotKeys.detail(spotId) })
    },
  })
}
