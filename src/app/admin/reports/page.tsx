'use client'

import { useState, useCallback } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useInvalidateAdminReports } from '@/hooks/useAdminQueries'
import { AdminReportList } from '@/components/admin/AdminReportList'
import { AdminReportReview } from '@/components/admin/AdminReportReview'
import type { SpotReport } from '@/types/report'

/**
 * 관리자 제보 관리 페이지
 * Requirements: 4.6, 5.4, 5.5
 */
export default function AdminReportsPage() {
  const { isLoading, isAuthorized } = useAdminAuth()
  const [selectedReport, setSelectedReport] = useState<SpotReport | null>(null)
  const invalidateReports = useInvalidateAdminReports()

  const handleSelectReport = useCallback((report: SpotReport) => {
    setSelectedReport(report)
  }, [])

  const handleReviewComplete = useCallback(() => {
    setSelectedReport(null)
    invalidateReports()
  }, [invalidateReports])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    )
  }

  // 비관리자는 useAdminAuth가 자동 리다이렉트 — 리다이렉트 완료까지 빈 화면 유지
  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-surface px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-800">제보 관리</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          유저 제보를 검토하고 승인/반려할 수 있습니다
        </p>
      </div>

      <div className="flex h-[calc(100vh-theme(spacing.14)-73px)]">
        <div className="w-96 flex-shrink-0 border-r border-neutral-200 bg-surface">
          <AdminReportList
            onSelectReport={handleSelectReport}
            selectedReportId={selectedReport?.id}
          />
        </div>

        <div className="flex-1 bg-neutral-50">
          {selectedReport ? (
            <AdminReportReview
              key={selectedReport.id}
              report={selectedReport}
              onReviewComplete={handleReviewComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-neutral-400">
                <p className="text-4xl">📋</p>
                <p className="mt-2 text-sm">좌측 목록에서 제보를 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
