'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SpotStatusReport } from '@/types/report'

interface AdminStatusReportsResponse {
  reports: SpotStatusReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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

const SPOT_STATUS_LABELS: Record<string, string> = {
  normal: '정상',
  partially_changed: '일부 변경',
  under_construction: '공사중',
  demolished: '소실됨',
  inaccessible: '접근 불가',
}

interface AdminStatusReportListProps {
  onSelectReport: (report: SpotStatusReport) => void
  selectedReportId?: string
  refreshKey?: number
}

/**
 * 관리자 상태 신고 목록 컴포넌트
 * Requirements: 5.1, 5.3
 * - reviewStatus별 필터 (전체/대기 중/확인 완료)
 * - 신고 상태 유형별 필터 (전체/정상/일부 변경/공사중/소실됨/접근 불가)
 * - 페이지네이션 (page, limit)
 * - 신고 상태, 신고자명, 대상 스팟명, reviewStatus 배지 표시
 */
export function AdminStatusReportList({
  onSelectReport,
  selectedReportId,
  refreshKey = 0,
}: AdminStatusReportListProps) {
  const [reports, setReports] = useState<SpotStatusReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewStatusFilter, setReviewStatusFilter] = useState('pending')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        reviewStatus: reviewStatusFilter,
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      })

      const res = await fetch(`/api/admin/status-reports?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '상태 신고 목록 조회 실패')
      }

      const data: AdminStatusReportsResponse = await res.json()
      setReports(data.reports)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [reviewStatusFilter, statusFilter, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports, refreshKey])

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
        {error}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* 필터 영역 */}
      <div className="space-y-2 border-b border-gray-200 p-3">
        {/* reviewStatus 필터 */}
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
        {/* 신고 상태 유형 필터 */}
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
        {loading ? (
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

function ReviewStatusBadge({ reviewStatus }: { reviewStatus: string }) {
  const config: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    pending: {
      label: '대기 중',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    resolved: {
      label: '확인 완료',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
  }
  const c = config[reviewStatus] || config.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bgColor} ${c.textColor}`}
    >
      {c.label}
    </span>
  )
}

function StatusReportSummaryCard({
  report,
  isSelected,
  onClick,
}: {
  report: SpotStatusReport
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? 'border-navy-400 bg-navy-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              {SPOT_STATUS_LABELS[report.status] || report.status}
            </span>
            <ReviewStatusBadge reviewStatus={report.reviewStatus} />
          </div>
          <p className="mt-1.5 truncate text-sm font-medium text-gray-800">
            {report.description.slice(0, 50)}
            {report.description.length > 50 ? '...' : ''}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{report.reporterName}</span>
            <span>·</span>
            <span>
              {new Date(report.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
