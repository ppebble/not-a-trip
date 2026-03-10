'use client'

import { useState } from 'react'
import { useAdminStatusReports } from '@/hooks/useAdminQueries'
import { StatusReportSummaryCard } from './StatusReportSummaryCard'
import type { SpotStatusReport } from '@/types/report'

const REVIEW_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: '대기 중' },
  { value: 'all', label: '전체' },
  { value: 'resolved', label: '확인 완료' },
]

const SPOT_STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'normal', label: '정상' },
  { value: 'partially_changed', label: '일부 변경' },
  { value: 'under_construction', label: '공사중' },
  { value: 'demolished', label: '소실됨' },
  { value: 'inaccessible', label: '접근 불가' },
]

interface AdminStatusReportListProps {
  onSelectReport: (report: SpotStatusReport) => void
  selectedReportId?: string
}

/**
 * 관리자 상태 신고 목록 컴포넌트
 * Requirements: 5.1, 5.3, 8.3
 */
export function AdminStatusReportList({
  onSelectReport,
  selectedReportId,
}: AdminStatusReportListProps) {
  const [reviewStatusFilter, setReviewStatusFilter] = useState('pending')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useAdminStatusReports(
    reviewStatusFilter,
    statusFilter,
    page
  )

  const reports = data?.reports ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleReviewStatusChange = (value: string) => {
    setReviewStatusFilter(value)
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {error instanceof Error ? error.message : '오류가 발생했습니다'}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* 필터 영역 */}
      <div className="space-y-2 border-b border-gray-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleReviewStatusChange(filter.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                reviewStatusFilter === filter.value
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SPOT_STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleStatusChange(filter.value)}
              className={`rounded-full px-2.5 py-0.5 text-xs transition-colors ${
                statusFilter === filter.value
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">총 {total}건</p>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {reviewStatusFilter === 'pending'
              ? '대기 중인 상태 신고가 없습니다'
              : '해당 조건의 상태 신고가 없습니다'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {reports.map((report) => (
              <StatusReportSummaryCard
                key={report.id}
                report={report}
                isSelected={selectedReportId === report.id}
                onClick={() => onSelectReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-200 p-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
