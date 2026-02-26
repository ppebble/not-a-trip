import { useQuery } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import { reportKeys } from './useSpotReport'
import type { SpotReport } from '@/types/report'

/** 내 제보 목록 응답 */
interface MyReportsResponse {
  reports: SpotReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * 내 제보 목록 조회 훅
 * GET /api/reports
 * Requirements: 1.6, 2.2
 */
export function useMyReports(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: [...reportKeys.lists(), { page, limit }],
    queryFn: async (): Promise<MyReportsResponse> => {
      const url = buildUrl(API_ROUTES.REPORTS.BASE, { page, limit })
      const response = await fetch(url)

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제보 목록 조회에 실패했습니다')
      }
      return response.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}
