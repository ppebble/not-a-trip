'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SubTabNavigation } from '@/components/profile/SubTabNavigation'
import { useUserRoutes, useUserBookmarks } from '@/hooks/useUserQueries'

interface CollectionSectionProps {
  userId: string
  isOwner: boolean
}

type CollectionTab = 'routes' | 'bookmarks'

const COLLECTION_TABS = [
  { key: 'routes', label: '내가 만든 코스' },
  { key: 'bookmarks', label: '저장한 코스' },
] as const

/**
 * 날짜 포맷 함수
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
 * 보관함 섹션 컴포넌트 — 내가 만든 코스, 저장한 코스
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 11.2, 11.3
 */
export function CollectionSection({ userId, isOwner }: CollectionSectionProps) {
  const [activeTab, setActiveTab] = useState<CollectionTab>('routes')

  const isBookmarksEnabled = activeTab === 'bookmarks'

  const { data: routes = [], isLoading: routesLoading } = useUserRoutes(
    userId,
    true
  )
  const { data: bookmarks = [], isLoading: bookmarksLoading } =
    useUserBookmarks(userId, isBookmarksEnabled)

  return (
    <div>
      {/* 하위 탭 네비게이션 */}
      <div className="mb-5">
        <SubTabNavigation
          tabs={COLLECTION_TABS as unknown as { key: string; label: string }[]}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as CollectionTab)}
        />
      </div>

      {/* 내가 만든 코스 탭 */}
      {activeTab === 'routes' && (
        <RoutesTab
          routes={routes}
          isLoading={routesLoading}
          isOwner={isOwner}
        />
      )}

      {/* 저장한 코스 탭 */}
      {activeTab === 'bookmarks' && (
        <BookmarksTab
          bookmarks={bookmarks}
          isLoading={bookmarksLoading}
          isOwner={isOwner}
        />
      )}
    </div>
  )
}

// ── 내가 만든 코스 탭 ──────────────────────────────────────────

interface RoutesTabProps {
  routes: {
    id: string
    name: string
    spotCount: number
    bookmarkCount: number
    createdAt: string
  }[]
  isLoading: boolean
  isOwner: boolean
}

function RoutesTab({ routes, isLoading, isOwner }: RoutesTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (routes.length === 0) {
    return (
      <EmptyState
        message="아직 만든 코스가 없습니다"
        actionLabel={isOwner ? '코스 만들기' : undefined}
        actionHref={isOwner ? '/routes/create' : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      {routes.map((route) => (
        <Link
          key={route.id}
          href={`/routes/${route.id}`}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm transition-colors hover:bg-neutral-50"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {route.name}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {route.spotCount}개 스팟 · {formatDate(route.createdAt)} 생성
            </p>
          </div>
          <div className="ml-3 flex flex-shrink-0 items-center gap-3">
            {/* 북마크 수 */}
            <div className="flex items-center gap-1 text-sm text-neutral-400">
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
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>{route.bookmarkCount}</span>
            </div>
            <svg
              className="h-4 w-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      ))}
    </div>
  )
}

// ── 저장한 코스 탭 ──────────────────────────────────────────

interface BookmarksTabProps {
  bookmarks: {
    id: string
    name: string
    authorName: string
    spotCount: number
    bookmarkedAt: string
  }[]
  isLoading: boolean
  isOwner: boolean
}

function BookmarksTab({ bookmarks, isLoading, isOwner }: BookmarksTabProps) {
  if (isLoading) {
    return <ListSkeleton />
  }

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        message="아직 저장한 코스가 없습니다"
        actionLabel={isOwner ? '코스 탐색하기' : undefined}
        actionHref={isOwner ? '/routes' : undefined}
      />
    )
  }

  return (
    <div className="space-y-3">
      {bookmarks.map((bookmark) => (
        <Link
          key={bookmark.id}
          href={`/routes/${bookmark.id}`}
          className="flex items-center justify-between rounded-xl border border-neutral-100 bg-surface p-4 shadow-sm transition-colors hover:bg-neutral-50"
        >
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-800">
              {bookmark.name}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-500">
              {bookmark.authorName} · {bookmark.spotCount}개 스팟
            </p>
          </div>
          <svg
            className="ml-3 h-4 w-4 flex-shrink-0 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      ))}
    </div>
  )
}

// ── 공통 컴포넌트 ──────────────────────────────────────────

interface EmptyStateProps {
  message: string
  actionLabel?: string
  actionHref?: string
}

function EmptyState({ message, actionLabel, actionHref }: EmptyStateProps) {
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
      <p className="text-neutral-500">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-block rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
      ))}
    </div>
  )
}
