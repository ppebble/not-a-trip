'use client'

import Image from 'next/image'
import { Badge } from '@/types'

interface BadgeCardProps {
  badge: Badge
  earned: boolean
  earnedAt?: Date
  progress?: number
  className?: string
}

/**
 * 뱃지 카드 컴포넌트
 * Requirements: 4.5
 */
export function BadgeCard({
  badge,
  earned,
  earnedAt,
  progress,
  className = '',
}: BadgeCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      className={`relative rounded-xl p-4 text-center transition-all ${
        earned
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50'
          : 'bg-gray-100 opacity-60'
      } ${className}`}
    >
      {/* 뱃지 아이콘 */}
      <div
        className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full shadow-lg ${
          earned
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
            : 'bg-gray-300'
        }`}
      >
        {badge.iconUrl ? (
          <Image
            src={badge.iconUrl}
            alt={badge.name}
            width={40}
            height={40}
            className={earned ? '' : 'grayscale'}
          />
        ) : (
          <svg
            className={`h-8 w-8 ${earned ? 'text-white' : 'text-gray-500'}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
      </div>

      {/* 뱃지 정보 */}
      <h3 className={`font-bold ${earned ? 'text-gray-800' : 'text-gray-500'}`}>
        {badge.name}
      </h3>
      <p className="mt-1 text-xs text-gray-500">{badge.description}</p>

      {/* 획득 날짜 또는 진행률 */}
      {earned && earnedAt ? (
        <p className="mt-2 text-xs text-green-600">
          ✓ {formatDate(earnedAt)} 획득
        </p>
      ) : progress !== undefined ? (
        <div className="mt-3">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">{progress}% 달성</p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-400">미획득</p>
      )}

      {/* 잠금 아이콘 (미획득 시) */}
      {!earned && (
        <div className="absolute right-2 top-2">
          <svg
            className="h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
      )}
    </div>
  )
}
