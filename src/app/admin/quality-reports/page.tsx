'use client'

import { useCallback, useState } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { useInvalidateAdminQualityReports } from '@/hooks/useAdminQueries'
import { AdminQualityReportList } from '@/components/admin/AdminQualityReportList'
import { AdminQualityReportReview } from '@/components/admin/AdminQualityReportReview'
import type { AdminQualityReport } from '@/hooks/useAdminQueries'

export default function AdminQualityReportsPage() {
  const { isLoading, isAuthorized } = useAdminAuth()
  const [selectedReport, setSelectedReport] =
    useState<AdminQualityReport | null>(null)
  const invalidateQualityReports = useInvalidateAdminQualityReports()

  const handleSelectReport = useCallback((report: AdminQualityReport) => {
    setSelectedReport(report)
  }, [])

  const handleReviewComplete = useCallback(() => {
    setSelectedReport(null)
    invalidateQualityReports()
  }, [invalidateQualityReports])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="text-neutral-500">로딩 중...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-surface px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-800">품질 신고 검토</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          정보 오류, 폐업/폐쇄, 중복 스팟 등 품질 신고를 검토하고 보완 요청을
          생성합니다.
        </p>
      </div>

      <div className="flex h-[calc(100vh-theme(spacing.14)-73px)]">
        <div className="w-96 flex-shrink-0 border-r border-neutral-200 bg-surface">
          <AdminQualityReportList
            onSelectReport={handleSelectReport}
            selectedReportId={selectedReport?.id}
          />
        </div>

        <div className="flex-1 bg-neutral-50">
          {selectedReport ? (
            <AdminQualityReportReview
              key={selectedReport.id}
              report={selectedReport}
              onReviewComplete={handleReviewComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-neutral-400">
                <p className="text-4xl">🛠️</p>
                <p className="mt-2 text-sm">
                  왼쪽 목록에서 품질 신고를 선택하세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
