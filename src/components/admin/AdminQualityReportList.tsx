'use client'

import { useState } from 'react'
import {
  useAdminQualityReports,
  type AdminQualityReport,
} from '@/hooks/useAdminQueries'
import { QualityReportSummaryCard } from './QualityReportSummaryCard'
import type { ReportProcessingStatus } from '@/types/spot-quality'

const STATUS_FILTERS: {
  value: ReportProcessingStatus | 'open' | 'all'
  label: string
}[] = [
  { value: 'open', label: '열린 신고' },
  { value: 'pending', label: '대기' },
  { value: 'in_review', label: '검토 중' },
  { value: 'sla_exceeded', label: 'SLA 초과' },
  { value: 'resolved', label: '해결' },
  { value: 'rejected', label: '반려' },
  { value: 'all', label: '전체' },
]

interface AdminQualityReportListProps {
  onSelectReport: (report: AdminQualityReport) => void
  selectedReportId?: string
}

export function AdminQualityReportList({
  onSelectReport,
  selectedReportId,
}: AdminQualityReportListProps) {
  const [statusFilter, setStatusFilter] = useState<
    ReportProcessingStatus | 'open' | 'all'
  >('open')
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [spotId, setSpotId] = useState('')

  const { data, isLoading, error } = useAdminQualityReports(
    statusFilter,
    urgentOnly,
    spotId.trim()
  )

  const reports = data?.reports ?? []
  const total = data?.total ?? 0

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {error instanceof Error ? error.message : '오류가 발생했습니다'}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-3 border-b border-neutral-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
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

        <label className="flex items-center gap-2 text-xs text-neutral-600">
          <input
            type="checkbox"
            checked={urgentOnly}
            onChange={(event) => setUrgentOnly(event.target.checked)}
            className="rounded border-neutral-300"
          />
          긴급 신고만 보기
        </label>

        <input
          value={spotId}
          onChange={(event) => setSpotId(event.target.value)}
          placeholder="스팟 ID로 필터링"
          className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
        />

        <p className="text-xs text-neutral-400">총 {total}건</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-400">
            조건에 맞는 품질 신고가 없습니다.
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {reports.map((report) => (
              <QualityReportSummaryCard
                key={report.id}
                report={report}
                isSelected={selectedReportId === report.id}
                onClick={() => onSelectReport(report)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
