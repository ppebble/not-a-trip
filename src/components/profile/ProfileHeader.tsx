'use client'

import Image from 'next/image'
import { AppIcon } from '@/components/common/AppIcon'
import type { UserInfo } from '@/hooks/useUserQueries'
import type { ExtendedUserStats } from '@/types/profile'

interface ProfileHeaderProps {
  userInfo: UserInfo
  stats: ExtendedUserStats
  isOwner: boolean
  onEditClick: () => void
}

/**
 * 가입일 포맷팅 유틸 함수
 * @param createdAt ISO 8601 형식의 날짜 문자열
 * @returns "YYYY년 MM월 가입" 형식의 문자열
 */
function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}년 ${month}월 가입`
}

interface StatItemProps {
  value: number
  label: string
}

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-neutral-800">{value}</span>
      <span className="text-xs text-neutral-500">{label}</span>
    </div>
  )
}

/**
 * 프로필 헤더 컴포넌트 — 유저 정보 + 통계 + 편집 버튼
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */
export function ProfileHeader({
  userInfo,
  stats,
  isOwner,
  onEditClick,
}: ProfileHeaderProps) {
  return (
    <div className="rounded-xl bg-surface p-6 shadow-sm">
      {/* 유저 기본 정보 */}
      <div className="flex items-center gap-4">
        {/* 프로필 이미지 */}
        <div className="flex-shrink-0">
          {userInfo.image ? (
            <Image
              src={userInfo.image}
              alt={userInfo.name}
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
              <AppIcon name="profile-front" size={72} />
            </div>
          )}
        </div>

        {/* 이름 + 가입일 + 편집 버튼 */}
        <div className="flex flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-neutral-900">
              {userInfo.name}
            </h1>
            {isOwner && (
              <button
                onClick={onEditClick}
                className="rounded-lg border border-neutral-300 px-3 py-1 text-sm text-neutral-600 transition-colors hover:bg-neutral-50"
                aria-label="프로필 편집"
              >
                편집
              </button>
            )}
          </div>
          {userInfo.createdAt && (
            <p className="text-sm text-neutral-500">
              {formatJoinDate(userInfo.createdAt)}
            </p>
          )}
        </div>
      </div>

      {/* 통계 영역 */}
      <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-7">
        <StatItem value={stats.totalCheckIns} label="총 인증" />
        <StatItem value={stats.uniqueSpots} label="방문 스팟" />
        <StatItem value={stats.badgeCount} label="획득 배지" />
        <StatItem value={stats.completedRoutes} label="완주 코스" />
        <StatItem value={stats.registeredSpots} label="등록 스팟" />
        <StatItem value={stats.reportCount} label="제보" />
        <StatItem value={stats.postCount} label="게시글" />
      </div>
    </div>
  )
}
