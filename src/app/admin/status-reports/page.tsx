'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { AdminStatusReportList } from '@/components/admin/AdminStatusReportList'
import { AdminStatusReportReview } from '@/components/admin/AdminStatusReportReview'
import { useInvalidateAdminStatusReports } from '@/hooks/useAdminQueries'
import type { SpotStatusReport } from '@/types/report'

/**
 * 관리자 상태 신고 검토 페이지
 * Requirements: 5.1, 5.2, 8.3
 */
export default function AdminStatusReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedReport, setSelectedReport] = useState<SpotStatusReport | null>(
    null
  )
  const invalidateStatusReports = useInvalidateAdminStatusReports()

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
    }
  }, [status, session, router])

  const handleSelectReport = useCallback((report: SpotStatusReport) => {
    setSelectedReport(report)
  }, [])

  const handleReviewComplete = useCallback(() => {
    setSelectedReport(null)
    invalidateStatusReports()
  }, [invalidateStatusReports])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-800">
            접근 권한 없음
          </h1>
          <p className="text-gray-600">관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-gray-800">상태 신고 검토</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          사용자가 신고한 스팟 상태를 검토하고 확인 처리할 수 있습니다
        </p>
      </div>

      <div className="flex h-[calc(100vh-theme(spacing.14)-73px)]">
        <div className="w-96 flex-shrink-0 border-r border-gray-200 bg-white">
          <AdminStatusReportList
            onSelectReport={handleSelectReport}
            selectedReportId={selectedReport?.id}
          />
        </div>

        <div className="flex-1 bg-gray-50">
          {selectedReport ? (
            <AdminStatusReportReview
              key={selectedReport.id}
              report={selectedReport}
              onReviewComplete={handleReviewComplete}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-4xl">🚨</p>
                <p className="mt-2 text-sm">
                  좌측 목록에서 상태 신고를 선택하세요
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
