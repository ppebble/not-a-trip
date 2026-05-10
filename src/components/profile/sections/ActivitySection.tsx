'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SubTabNavigation } from '@/components/profile/SubTabNavigation'
import { CheckInGallery } from '@/components/checkin'
import { TrophyRoom } from '@/components/profile/TrophyRoom'
import { ContentProgressCard } from '@/components/profile/ContentProgressCard'
import {
  useUserCompletions,
  useUserBadges,
  useUserProgress,
} from '@/hooks/useUserQueries'

interface ActivitySectionProps {
  userId: string
  isOwner: boolean
}

type ActivityTab = 'checkins' | 'completions' | 'badges' | 'progress'

const ACTIVITY_TABS = [
  { key: 'checkins', label: '인증 갤러리' },
  { key: 'completions', label: '코스 완주' },
  { key: 'badges', label: '트로피 룸' },
  { key: 'progress', label: '진행 현황' },
] as const

/**
 * 완주 기록 날짜 포맷
 */
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 활동 섹션 컴포넌트 — 인증 갤러리, 코스 완주, 트로피 룸, 진행 현황
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 11.1, 11.2, 11.3
 */
export function ActivitySection({ userId, isOwner }: ActivitySectionProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('checkins')

  const isCompletionsEnabled = activeTab === 'completions'
  const isBadgesEnabled = activeTab === 'badges'
  const isProgressEnabled = activeTab === 'progress'

  const { data: completions = [], isLoading: completionsLoading } =
    useUserCompletions(userId, isCompletionsEnabled)
  const { data: badges = [], isLoading: badgesLoading } = useUserBadges(userId)
  const { data: progress = [], isLoading: progressLoading } =
    useUserProgress(userId)

  return (
    <div>
      {/* 하위 탭 네비게이션 */}
      <div className="mb-5">
        <SubTabNavigation
          tabs={ACTIVITY_TABS as unknown as { key: string; label: string }[]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as ActivityTab)}
        />
      </div>

      {/* 인증 갤러리 탭 */}
      {activeTab === 'checkins' && (
        <CheckInGalleryTab userId={userId} isOwner={isOwner} />
      )}

      {/* 코스 완주 탭 */}
      {activeTab === 'completions' && (
        <CompletionsTab
          completions={completions}
          isLoading={completionsLoading}
          isOwner={isOwner}
        />
      )}

      {/* 트로피 룸 탭 */}
      {activeTab === 'badges' && (
        <div>
          {badgesLoading ? <BadgesSkeleton /> : <TrophyRoom badges={badges} />}
        </div>
      )}

      {/* 진행 현황 탭 */}
      {activeTab === 'progress' && (
        <ProgressTab progress={progress} isLoading={progressLoading} />
      )}
    </div>
  )
}

// ── 인증 갤러리 탭 ──────────────────────────────────────────

interface CheckInGalleryTabProps {
  userId: string
  isOwner: boolean
}

function CheckInGalleryTab({ userId, isOwner }: CheckInGalleryTabProps) {
  return <CheckInGallery userId={userId} limit={12} />
}

// ── 코스 완주 탭 ──────────────────────────────────────────

interface CompletionsTabProps {
  completions: {
    id: string
    routeId: string
    routeName: string
    spotCount: number
    completedAt: string
  }[]
  isLoading: boolean
  isOwner: boolean
}

function CompletionsTab({
  completions,
  isLoading,
  isOwner,
}: CompletionsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    )
  }

  if (completions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <svg
            className="h-8 w-8 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </div>
        <p className="text-neutral-500">아직 완주한 코스가 없습니다</p>
        {isOwner && (
          <Link
            href="/routes"
            className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            코스 탐색하기
          </Link>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {completions.map((completion) => (
        <div
          key={completion.id}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm"
        >
          <div>
            <h3 className="font-semibold text-neutral-800">
              {completion.routeName}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {completion.spotCount}개 스팟 ·{' '}
              {formatDate(completion.completedAt)} 완주
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-5 w-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 진행 현황 탭 ──────────────────────────────────────────

interface ProgressTabProps {
  progress: {
    contentName: string
    progress: number
    checkedSpots: number
    totalSpots: number
  }[]
  isLoading: boolean
}

function ProgressTab({ progress, isLoading }: ProgressTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl bg-neutral-100"
          />
        ))}
      </div>
    )
  }

  if (progress.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-neutral-500">아직 진행 중인 작품이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {progress.map((p) => (
        <ContentProgressCard key={p.contentName} progress={p} />
      ))}
    </div>
  )
}

// ── 스켈레톤 ──────────────────────────────────────────

function BadgesSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-32 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  )
}
