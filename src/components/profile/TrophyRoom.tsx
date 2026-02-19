'use client'

import Image from 'next/image'
import { UserBadge } from '@/types'

interface TrophyRoomProps {
  badges: UserBadge[]
  className?: string
}

/**
 * 트로피 룸 컴포넌트 - 획득한 뱃지 표시
 * Requirements: 3.1
 */
export function TrophyRoom({ badges, className = '' }: TrophyRoomProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (badges.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
        </div>
        <p className="text-gray-500">아직 획득한 뱃지가 없습니다</p>
        <p className="mt-1 text-sm text-gray-400">
          성지를 방문하고 인증하면 뱃지를 획득할 수 있어요!
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {badges.map((userBadge) => (
          <div
            key={userBadge.id}
            className="group relative rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 p-4 text-center transition-transform hover:scale-105"
          >
            {/* 뱃지 아이콘 */}
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg">
              {userBadge.badge?.iconUrl ? (
                <Image
                  src={userBadge.badge.iconUrl}
                  alt={userBadge.badge.name}
                  width={40}
                  height={40}
                />
              ) : (
                <svg
                  className="h-8 w-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>

            {/* 뱃지 정보 */}
            <h3 className="font-bold text-gray-800">
              {userBadge.badge?.name || '뱃지'}
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              {formatDate(userBadge.earnedAt)}
            </p>

            {/* 호버 시 설명 표시 */}
            {userBadge.badge?.description && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/80 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="px-3 text-sm text-white">
                  {userBadge.badge.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
