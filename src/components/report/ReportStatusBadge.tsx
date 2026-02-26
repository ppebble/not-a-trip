'use client'

import type { ReportStatus } from '@/types/report'

interface ReportStatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  ReportStatus,
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
  revision_requested: {
    label: '수정요청',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
}

/**
 * 제보 상태 뱃지 컴포넌트
 * Requirements: 1.6
 */
export function ReportStatusBadge({
  status,
  size = 'sm',
}: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {config.label}
    </span>
  )
}
