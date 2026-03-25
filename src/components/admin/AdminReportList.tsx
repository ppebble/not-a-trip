'use client'

import { useState } from 'react'
import { useAdminReports } from '@/hooks/useAdminQueries'
import { ReportSummaryCard } from './ReportSummaryCard'
import type { SpotReport } from '@/types/report'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: '대기중' },
  { value: 'all', label: '전체' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
  { value: 'revision_requested', label: '수정요청' },
]

interface AdminReportListProps {
  onSelectReport: (report: SpotReport) => void
  selectedReportId?: string
}

/**
 * 관리자 제보 목록 컴포넌트
 * Requirements: 5.1, 8.3
 */
export function AdminReportList({
  onSelectReport,
  selectedReportId,
}: AdminReportListProps) {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useAdminReports(statusFilter, page)

  const reports = data?.reports ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleFilterChange = (value: string) => {
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
      {/* 상태 필터 */}
      <div className="border-b border-neutral-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-400">총 {total}건</p>
      </div>

      {/* 제보 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            {statusFilter === 'pending'
              ? '대기중인 제보가 없습니다'
              : '해당 상태의 제보가 없습니다'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {reports.map((report) => (
              <ReportSummaryCard
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
        <div className="flex items-center justify-center gap-2 border-t border-neutral-200 p-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-xs text-neutral-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded px-2 py-1 text-xs text-neutral-600 hover:bg-neutral-100 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
