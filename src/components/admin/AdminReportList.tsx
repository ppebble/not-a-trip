'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import { CATEGORY_CONFIG } from '@/types/spot'
import type { SpotReport } from '@/types/report'

interface AdminReportsResponse {
  reports: SpotReport[]
  total: number
  page: number
  limit: number
  totalPages: number
}

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
  /** 외부에서 목록 새로고침을 트리거하기 위한 카운터 */
  refreshKey?: number
}

/**
 * 관리자 제보 목록 컴포넌트
 * Requirements: 5.1
 * - 대기중 제보 목록 (상태 필터, 최신순 정렬)
 * - 제보 요약 카드 (장소명, 카테고리, 제보자, 제출일)
 */
export function AdminReportList({
  onSelectReport,
  selectedReportId,
  refreshKey = 0,
}: AdminReportListProps) {
  const [reports, setReports] = useState<SpotReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      })

      const res = await fetch(`/api/admin/reports?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '제보 목록 조회 실패')
      }

      const data: AdminReportsResponse = await res.json()
      setReports(data.reports)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchReports()
  }, [fetchReports, refreshKey])

  // 필터 변경 시 페이지 초기화
  const handleFilterChange = (value: string) => {
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
      {/* 상태 필터 */}
      <div className="border-b border-gray-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">총 {total}건</p>
      </div>

      {/* 제보 목록 */}
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

function ReportSummaryCard({
  report,
  isSelected,
  onClick,
}: {
  report: SpotReport
  isSelected: boolean
  onClick: () => void
}) {
  const categoryConfig = report.category
    ? CATEGORY_CONFIG[report.category]
    : null
  const thumbnail = report.evidencePairs?.[0]?.realPhotoUrl

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? 'border-navy-400 bg-navy-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex gap-3">
        {/* 썸네일 */}
        {thumbnail ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={thumbnail}
              alt={report.name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xl">
            📍
          </div>
        )}

        {/* 정보 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-gray-800">
              {report.name}
            </p>
            <ReportStatusBadge status={report.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            {categoryConfig && <span>{categoryConfig.label}</span>}
            <span>·</span>
            <span>{report.reporterName}</span>
          </div>
          <p className="mt-0.5 text-xs text-gray-400">
            {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </button>
  )
}
