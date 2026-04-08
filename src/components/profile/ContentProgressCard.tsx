'use client'

import { ContentProgress } from '@/types'

interface ContentProgressCardProps {
  progress: ContentProgress
  className?: string
}

/**
 * 콘텐츠별 진행률 카드 컴포넌트
 * Requirements: 3.2
 */
export function ContentProgressCard({
  progress,
  className = '',
}: ContentProgressCardProps) {
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500'
    if (percent >= 50) return 'bg-primary'
    return 'bg-neutral-400'
  }

  const getProgressLabel = (percent: number) => {
    if (percent >= 100) return '정복 완료!'
    if (percent >= 50) return '탐험가'
    return '탐험 중'
  }

  return (
    <div
      className={`rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-neutral-800">{progress.contentName}</h3>
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium ${
            progress.progress >= 100
              ? 'bg-green-100 text-green-700'
              : progress.progress >= 50
                ? 'bg-primary-50 text-primary'
                : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {getProgressLabel(progress.progress)}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="mb-2 h-3 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full transition-all ${getProgressColor(progress.progress)}`}
          style={{ width: `${Math.min(progress.progress, 100)}%` }}
        />
      </div>

      {/* 통계 */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-500">
          {progress.checkedSpots} / {progress.totalSpots} 스팟
        </span>
        <span className="font-medium text-neutral-700">
          {progress.progress}%
        </span>
      </div>

      {/* 마일스톤 표시 */}
      {progress.progress > 0 && progress.progress < 100 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          {progress.progress < 50 ? (
            <span>
              50% 달성까지{' '}
              {Math.ceil(progress.totalSpots * 0.5) - progress.checkedSpots}곳
              남음
            </span>
          ) : (
            <span>
              정복까지 {progress.totalSpots - progress.checkedSpots}곳 남음
            </span>
          )}
        </div>
      )}
    </div>
  )
}
