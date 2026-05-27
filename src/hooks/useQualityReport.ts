import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { API_ROUTES } from '@/lib/api-routes'
import { spotKeys } from './useSpots'
import type { QualityReportType, SpotQualityReport } from '@/types/spot-quality'

interface QualityReportSummaryResponse {
  countsByType: Partial<Record<QualityReportType, number>>
  recentReports: SpotQualityReport[]
  urgentReviewRequired: boolean
  closureSuspected: boolean
}

export function useQualityReportSummary(spotId: string, enabled = true) {
  return useQuery({
    queryKey: [...spotKeys.detail(spotId), 'quality-summary'],
    queryFn: async (): Promise<QualityReportSummaryResponse> => {
      const response = await fetch(API_ROUTES.SPOTS.QUALITY_REPORTS(spotId))
      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.error || 'Failed to fetch quality report summary.'
        )
      }
      return response.json()
    },
    enabled: enabled && !!spotId,
    staleTime: 60 * 1000,
  })
}

export function useCreateQualityReport(spotId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      reportType: QualityReportType
      description: string
      evidencePhotos?: string[]
    }) => {
      const response = await fetch(API_ROUTES.SPOTS.QUALITY_REPORTS(spotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create quality report.')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: spotKeys.detail(spotId) })
      queryClient.invalidateQueries({
        queryKey: [...spotKeys.detail(spotId), 'quality-summary'],
      })
    },
  })
}
