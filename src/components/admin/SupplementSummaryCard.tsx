'use client'

import React from 'react'
import type { SpotSupplement } from '@/types/report'

const SUPPLEMENT_TYPE_LABELS: Record<string, string> = {
  scene_info: '씬 정보',
  description: '설명',
  photo: '사진',
  other: '기타',
}

export function SupplementStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    pending: {
      label: '대기중',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    approved: {
      label: '승인',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
    rejected: {
      label: '반려',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
    },
  }
  const c = config[status] || config.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bgColor} ${c.textColor}`}
    >
      {c.label}
    </span>
  )
}

interface SupplementSummaryCardProps {
  supplement: SpotSupplement
  isSelected: boolean
  onClick: () => void
}

/**
 * 정보 보완 요약 카드 컴포넌트
 * Requirements: 3.1, 8.2
 */
export const SupplementSummaryCard = React.memo(function SupplementSummaryCard({
  supplement,
  isSelected,
  onClick,
}: SupplementSummaryCardProps) {
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
              {SUPPLEMENT_TYPE_LABELS[supplement.type] || supplement.type}
            </span>
            <SupplementStatusBadge status={supplement.status} />
          </div>
          <p className="mt-1.5 truncate text-sm font-medium text-neutral-800">
            {supplement.content.slice(0, 50)}
            {supplement.content.length > 50 ? '...' : ''}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
            <span>{supplement.contributorName}</span>
            <span>·</span>
            <span>
              {new Date(supplement.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
})
