'use client'

import React from 'react'
import { AdminStatusBadge } from './AdminReviewPrimitives'
import type { SpotStatusReport } from '@/types/report'

const SPOT_STATUS_LABELS: Record<string, string> = {
  normal: '정상',
  partially_changed: '일부 변경',
  under_construction: '공사중',
  demolished: '소실됨',
  inaccessible: '접근 불가',
}

export function ReviewStatusBadge({ reviewStatus }: { reviewStatus: string }) {
  const config: Record<
    string,
    {
      label: string
      tone: React.ComponentProps<typeof AdminStatusBadge>['tone']
    }
  > = {
    pending: { label: '대기 중', tone: 'warning' },
    resolved: { label: '확인 완료', tone: 'success' },
  }
  const c = config[reviewStatus] || config.pending

  return <AdminStatusBadge tone={c.tone}>{c.label}</AdminStatusBadge>
}

interface StatusReportSummaryCardProps {
  report: SpotStatusReport
  isSelected: boolean
  onClick: () => void
}

/**
 * 상태 신고 요약 카드 컴포넌트
 * Requirements: 5.1, 8.2
 */
export const StatusReportSummaryCard = React.memo(
  function StatusReportSummaryCard({
    report,
    isSelected,
    onClick,
  }: StatusReportSummaryCardProps) {
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
            <div className="flex items-center gap-2">
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600">
                {SPOT_STATUS_LABELS[report.status] || report.status}
              </span>
              <ReviewStatusBadge reviewStatus={report.reviewStatus} />
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-neutral-800">
              {report.description.slice(0, 50)}
              {report.description.length > 50 ? '...' : ''}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
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
