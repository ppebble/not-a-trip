'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { AppIcon } from '@/components/common/AppIcon'
import { RouteListContent } from '@/components/route/RouteListContent'
import { RecommendedRoutes } from '@/components/route/RecommendedRoutes'
import { SkeletonBlock } from '@/components/common/SkeletonUI'

/** 코스 목록 페이지 스켈레톤 */
function RouteListSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <SkeletonBlock className="h-9 w-48" />
        <SkeletonBlock className="h-9 w-32" />
        <SkeletonBlock className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-lg border border-neutral-200 bg-surface dark:bg-neutral-800"
          >
            <SkeletonBlock className="h-40 w-full rounded-none" />
            <div className="p-4">
              <SkeletonBlock className="mb-2 h-5 w-3/4" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 코스 목록 페이지
 * Requirements: 2.1, 2.2
 */
export default function RoutesPage() {
  return (
    <main className="min-h-screen bg-surface pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-main-text">
              <AppIcon name="map" size={28} />
              순례 코스
            </h1>
            <p className="mt-1 text-sm text-sub-text">
              다른 순례자들이 만든 코스를 탐색하고 따라가보세요
            </p>
          </div>
          <Link
            href="/routes/create"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            코스 만들기
          </Link>
        </div>

        {/* 추천 코스 섹션 - Requirements: 4.1, 4.2 */}
        <RecommendedRoutes />

        {/* 구분선 */}
        <div className="my-6 border-t border-neutral-200" />

        {/* 전체 코스 목록 */}
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-main-text">
          <AppIcon name="route" size={20} />
          전체 코스
        </h2>
        <Suspense fallback={<RouteListSkeleton />}>
          <RouteListContent />
        </Suspense>
      </div>
    </main>
  )
}
