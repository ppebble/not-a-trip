'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { SectionNavigation } from '@/components/profile/SectionNavigation'
import { useUserInfo, useUserStats } from '@/hooks/useUserQueries'
import { isProfileOwner } from '@/lib/profile-utils'
import type { ProfileSection, ExtendedUserStats } from '@/types/profile'
import type { UserStats } from '@/types/checkin'

const ActivitySection = dynamic(
  () =>
    import('@/components/profile/sections/ActivitySection').then(
      (mod) => mod.ActivitySection
    ),
  { loading: () => <SectionLoadingPlaceholder /> }
)

const ContributionSection = dynamic(
  () =>
    import('@/components/profile/sections/ContributionSection').then(
      (mod) => mod.ContributionSection
    ),
  { loading: () => <SectionLoadingPlaceholder /> }
)

const CommunitySection = dynamic(
  () =>
    import('@/components/profile/sections/CommunitySection').then(
      (mod) => mod.CommunitySection
    ),
  { loading: () => <SectionLoadingPlaceholder /> }
)

const CollectionSection = dynamic(
  () =>
    import('@/components/profile/sections/CollectionSection').then(
      (mod) => mod.CollectionSection
    ),
  { loading: () => <SectionLoadingPlaceholder /> }
)

const ManagementSection = dynamic(
  () =>
    import('@/components/profile/sections/ManagementSection').then(
      (mod) => mod.ManagementSection
    ),
  { loading: () => <SectionLoadingPlaceholder /> }
)

interface UserProfilePageProps {
  params: Promise<{ id: string }>
}

/**
 * UserStats를 ExtendedUserStats로 변환 (없는 필드는 0으로 채움)
 */
function toExtendedStats(stats: UserStats | undefined): ExtendedUserStats {
  return {
    userId: stats?.userId ?? '',
    totalCheckIns: stats?.totalCheckIns ?? 0,
    uniqueSpots: stats?.uniqueSpots ?? 0,
    badgeCount: stats?.badgeCount ?? 0,
    contentProgress: stats?.contentProgress ?? [],
    updatedAt: stats?.updatedAt ?? new Date(),
    completedRoutes:
      (stats as ExtendedUserStats | undefined)?.completedRoutes ?? 0,
    registeredSpots:
      (stats as ExtendedUserStats | undefined)?.registeredSpots ?? 0,
    reportCount: (stats as ExtendedUserStats | undefined)?.reportCount ?? 0,
    postCount: (stats as ExtendedUserStats | undefined)?.postCount ?? 0,
  }
}

/**
 * 유저 프로필 페이지 — 5섹션 활동 허브
 * Requirements: 2.1, 2.2, 2.4, 2.5, 2.6
 */
export default function UserProfilePage({ params }: UserProfilePageProps) {
  const { id: userId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()

  // URL 쿼리 파라미터에서 현재 섹션 읽기, 기본값 'activity'
  const sectionParam = searchParams.get('section') as ProfileSection | null
  const validSections: ProfileSection[] = [
    'activity',
    'contribution',
    'community',
    'collection',
    'management',
  ]
  const activeSection: ProfileSection =
    sectionParam && validSections.includes(sectionParam)
      ? sectionParam
      : 'activity'

  const { data: session } = useSession()
  const { data: userInfo, isLoading: userInfoLoading } = useUserInfo(userId)
  const { data: stats, isLoading: statsLoading } = useUserStats(userId)

  const isOwner = isProfileOwner(session?.user?.id, userId)

  const isLoading = userInfoLoading || statsLoading

  // 섹션 변경 시 URL 업데이트
  const handleSectionChange = (section: ProfileSection) => {
    router.push(`/profile/${userId}?section=${section}`)
  }

  // 편집 버튼 클릭 — 관리 섹션으로 이동
  const handleEditClick = () => {
    router.push(`/profile/${userId}?section=management`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse">
            {/* 헤더 스켈레톤 */}
            <div className="mb-6 rounded-xl bg-surface p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-neutral-200" />
                <div className="flex-1">
                  <div className="mb-2 h-6 w-32 rounded bg-neutral-200" />
                  <div className="h-4 w-48 rounded bg-neutral-200" />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-7">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="h-12 rounded bg-neutral-200" />
                ))}
              </div>
            </div>
            {/* 네비게이션 스켈레톤 */}
            <div className="mb-6 h-12 rounded-xl bg-surface shadow-sm" />
            {/* 콘텐츠 스켈레톤 */}
            <div className="h-64 rounded-xl bg-surface shadow-sm" />
          </div>
        </div>
      </div>
    )
  }

  if (!userInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-neutral-500">유저를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const extendedStats = toExtendedStats(stats)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="mb-4">
          <ProfileHeader
            userInfo={userInfo}
            stats={extendedStats}
            isOwner={isOwner}
            onEditClick={handleEditClick}
          />
        </div>

        {/* 섹션 네비게이션 */}
        <div className="mb-6 overflow-hidden rounded-xl shadow-sm">
          <SectionNavigation
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            isOwner={isOwner}
          />
        </div>

        {/* 섹션 콘텐츠 */}
        <div className="rounded-xl bg-surface p-6 shadow-sm">
          {/* 활동 섹션 */}
          {activeSection === 'activity' && (
            <ActivitySection userId={userId} isOwner={isOwner} />
          )}

          {/* 기여 섹션 */}
          {activeSection === 'contribution' && (
            <ContributionSection userId={userId} isOwner={isOwner} />
          )}

          {/* 커뮤니티 섹션 */}
          {activeSection === 'community' && (
            <CommunitySection userId={userId} isOwner={isOwner} />
          )}

          {/* 보관함 섹션 */}
          {activeSection === 'collection' && (
            <CollectionSection userId={userId} isOwner={isOwner} />
          )}

          {/* 관리 섹션 — Owner 전용 */}
          {activeSection === 'management' && isOwner && (
            <ManagementSection userId={userId} />
          )}

          {/* 관리 섹션 접근 차단 (비Owner) */}
          {activeSection === 'management' && !isOwner && (
            <div className="py-12 text-center text-neutral-500">
              접근 권한이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SectionLoadingPlaceholder() {
  return (
    <div className="space-y-4">
      <div className="h-5 w-40 animate-pulse rounded bg-neutral-200" />
      <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
      <div className="h-24 animate-pulse rounded-xl bg-neutral-100" />
    </div>
  )
}
