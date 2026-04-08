'use client'

import React from 'react'
import Image from 'next/image'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import { CATEGORY_CONFIG } from '@/types/spot'
import type { SpotReport } from '@/types/report'

interface ReportSummaryCardProps {
  report: SpotReport
  isSelected: boolean
  onClick: () => void
}

/**
 * 제보 요약 카드 컴포넌트
 * Requirements: 5.1, 8.2
 */
export const ReportSummaryCard = React.memo(function ReportSummaryCard({
  report,
  isSelected,
  onClick,
}: ReportSummaryCardProps) {
  const categoryConfig = report.category
    ? CATEGORY_CONFIG[report.category]
    : null
  const thumbnail = report.evidencePairs?.[0]?.realPhotoUrl

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? 'border-neutral-400 bg-primary-50'
          : 'border-neutral-200 bg-surface hover:bg-neutral-50'
      }`}
    >
      <div className="flex gap-3">
        {thumbnail ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={thumbnail}
              alt={report.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-xl">
            📍
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-medium text-neutral-800">
              {report.name}
            </p>
            <ReportStatusBadge status={report.status} />
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
            {categoryConfig && <span>{categoryConfig.label}</span>}
            <span>·</span>
            <span>{report.reporterName}</span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-400">
            {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>
    </button>
  )
})
