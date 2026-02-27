'use client'

import type { SpotStatus } from '@/types/report'

interface SpotStatusIndicatorProps {
  status?: SpotStatus
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<
  SpotStatus,
  { label: string; icon: string; bgColor: string; textColor: string }
> = {
  normal: {
    label: '정상',
    icon: '✅',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
  },
  partially_changed: {
    label: '일부 변경',
    icon: '🔄',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
  under_construction: {
    label: '공사중',
    icon: '🚧',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  demolished: {
    label: '소실됨',
    icon: '🏚️',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
  },
  inaccessible: {
    label: '접근 불가',
    icon: '🚫',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  },
}

/**
 * 스팟 상태 시각적 표시 컴포넌트
 * 지도 및 스팟 상세에서 상태별 아이콘/색상 구분
 * Requirements: 4.4
 */
export function SpotStatusIndicator({
  status,
  size = 'sm',
}: SpotStatusIndicatorProps) {
  if (!status) return null

  const config = STATUS_CONFIG[status]
  if (!config) return null

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}
