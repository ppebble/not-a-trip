'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AppIcon } from '@/components/common/AppIcon'
import { CheckInGallery } from '@/components/checkin'
import { TrophyRoom } from '@/components/profile/TrophyRoom'
import { ContentProgressCard } from '@/components/profile/ContentProgressCard'
import {
  useUserInfo,
  useUserStats,
  useUserBadges,
  useUserProgress,
  useUserReportedSpots,
} from '@/hooks/useUserQueries'

interface UserProfilePageProps {
  params: Promise<{ id: string }>
}

/**
 * 가입일 포맷팅 유틸 함수
 * Requirements: 3.5
 * @param createdAt ISO 8601 형식의 날짜 문자열
 * @returns "YYYY년 MM월 가입" 형식의 문자열
 */
function formatJoinDate(createdAt: string): string {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}년 ${month}월 가입`
}

/**
 * 유저 프로필 페이지
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2, 4.3, 4.4, 4.5
 */
export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id: userId } = use(params)
  const [activeTab, setActiveTab] = useState<
    'checkins' | 'badges' | 'progress' | 'reports'
  >('checkins')

  const { data: session } = useSession()
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo(userId)
  const { data: stats, isLoading: statsLoading } = useUserStats(userId)
  const { data: badges = [], isLoading: badgesLoading } = useUserBadges(userId)
  const { data: progress = [], isLoading: progressLoading } =
    useUserProgress(userId)
  const { data: reportedSpots = [], isLoading: spotsLoading } =
    useUserReportedSpots(userId)

  const isOwner = session?.user?.id === userId

  const isLoading =
    userInfoLoading ||
    statsLoading ||
    badgesLoading ||
    progressLoading ||
    spotsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="mb-2 h-6 w-32 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-200" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-lg bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="mb-8 rounded-xl bg-surface p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {userInfo?.image ? (
              <Image
                src={userInfo.image}
                alt={userInfo.name}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
                <AppIcon name="profile-front" size={72} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{userInfo?.name}</h1>
                {isOwner && (
                  <Link
                    href="/profile/edit"
                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
                  >
                    편집
                  </Link>
                )}
              </div>
              {userInfo?.createdAt && (
                <p className="text-sm text-gray-500">
                  {formatJoinDate(userInfo.createdAt)}
                </p>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {stats?.totalCheckIns || 0}
              </p>
              <p className="text-sm text-gray-500">총 인증</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {stats?.uniqueSpots || 0}
              </p>
              <p className="text-sm text-gray-500">방문 스팟</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {stats?.badgeCount || 0}
              </p>
              <p className="text-sm text-gray-500">획득 뱃지</p>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('checkins')}
            className={`rounded-lg px-4 py-2 font-medium ${
              activeTab === 'checkins'
                ? 'bg-blue-600 text-white'
                : 'bg-surface text-gray-600 hover:bg-gray-50'
            }`}
          >
            인증 갤러리
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`rounded-lg px-4 py-2 font-medium ${
              activeTab === 'badges'
                ? 'bg-blue-600 text-white'
                : 'bg-surface text-gray-600 hover:bg-gray-50'
            }`}
          >
            트로피 룸
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`rounded-lg px-4 py-2 font-medium ${
              activeTab === 'progress'
                ? 'bg-blue-600 text-white'
                : 'bg-surface text-gray-600 hover:bg-gray-50'
            }`}
          >
            진행 현황
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`rounded-lg px-4 py-2 font-medium ${
              activeTab === 'reports'
                ? 'bg-primary text-white'
                : 'bg-surface text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            제보한 스팟
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="rounded-xl bg-surface p-6 shadow-sm">
          {activeTab === 'checkins' && (
            <CheckInGallery userId={userId} limit={12} />
          )}

          {activeTab === 'badges' && <TrophyRoom badges={badges} />}

          {activeTab === 'progress' && (
            <div className="space-y-4">
              {progress.length > 0 ? (
                progress.map((p) => (
                  <ContentProgressCard key={p.contentName} progress={p} />
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">
                    아직 진행 중인 작품이 없습니다
                  </p>
                  <Link
                    href="/"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    성지 탐색하러 가기
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reportedSpots.length > 0 ? (
                reportedSpots.map((spot) => (
                  <Link
                    key={spot.id}
                    href={`/spots/${spot.id}`}
                    className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                  >
                    <p className="font-medium text-gray-900">{spot.name}</p>
                    {spot.address && (
                      <p className="mt-1 text-sm text-gray-500">
                        📍 {spot.address}
                      </p>
                    )}
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-gray-500">아직 제보한 스팟이 없습니다</p>
                  <Link
                    href="/reports/new"
                    className="mt-2 inline-block text-blue-600 hover:underline"
                  >
                    성지 제보하러 가기
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
