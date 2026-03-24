'use client'

import { Suspense } from 'react'
import Link from 'next/link'
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
            className="border-navy-200 overflow-hidden rounded-lg border bg-white"
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
    <main className="bg-navy-50 min-h-screen pt-14">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-navy-900 text-2xl font-bold">🗺️ 순례 코스</h1>
            <p className="text-navy-500 mt-1 text-sm">
              다른 순례자들이 만든 코스를 탐색하고 따라가보세요
            </p>
          </div>
          <Link
            href="/routes/create"
            className="bg-navy-600 hover:bg-navy-700 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
          >
            코스 만들기
          </Link>
        </div>

        {/* 추천 코스 섹션 - Requirements: 4.1, 4.2 */}
        <RecommendedRoutes />

        {/* 구분선 */}
        <div className="border-navy-200 my-6 border-t" />

        {/* 전체 코스 목록 */}
        <h2 className="text-navy-900 mb-4 text-lg font-bold">📋 전체 코스</h2>
        <Suspense fallback={<RouteListSkeleton />}>
          <RouteListContent />
        </Suspense>
      </div>
    </main>
  )
}
