'use client'

import React from 'react'
import type { AdminQualityReport } from '@/hooks/useAdminQueries'
import type {
  QualityReportType,
  ReportProcessingStatus,
} from '@/types/spot-quality'

const REPORT_TYPE_LABELS: Record<QualityReportType, string> = {
  inaccurate_info: '정보 오류',
  closed_permanently: '폐업/폐쇄',
  duplicate: '중복 스팟',
  inappropriate: '부적절 정보',
  other: '기타',
}

const STATUS_LABELS: Record<ReportProcessingStatus, string> = {
  pending: '대기',
  in_review: '검토 중',
  resolved: '해결',
  rejected: '반려',
  sla_exceeded: 'SLA 초과',
}

const STATUS_CLASSES: Record<ReportProcessingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_review: 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  sla_exceeded: 'bg-purple-100 text-purple-700',
}

export function QualityReportStatusBadge({
  status,
}: {
  status: ReportProcessingStatus
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
        STATUS_CLASSES[status] ?? STATUS_CLASSES.pending
      }`}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}

interface QualityReportSummaryCardProps {
  report: AdminQualityReport
  isSelected: boolean
  onClick: () => void
}

export const QualityReportSummaryCard = React.memo(
  function QualityReportSummaryCard({
    report,
    isSelected,
    onClick,
  }: QualityReportSummaryCardProps) {
    return (
      <button
        onClick={onClick}
        className={`w-full rounded-lg border p-3 text-left transition-colors ${
          isSelected
            ? 'border-neutral-400 bg-primary-50'
            : 'border-neutral-200 bg-surface hover:bg-neutral-50'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700">
                {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
              </span>
              <QualityReportStatusBadge status={report.status} />
              {report.isUrgent && (
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  긴급
                </span>
              )}
              {report.nearingDeadline && report.status !== 'sla_exceeded' && (
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                  마감 임박
                </span>
              )}
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-neutral-800">
              {report.description || '설명 없음'}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
              <span>{report.spotId}</span>
              <span>·</span>
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
)

export { REPORT_TYPE_LABELS, STATUS_LABELS }
