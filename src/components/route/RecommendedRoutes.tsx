'use client'

import { useState, useEffect } from 'react'
import { RouteCard } from '@/components/route/RouteCard'
import { AppIcon } from '@/components/common/AppIcon'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

interface RecommendedData {
  official: Route[]
  popular: Route[]
}

/** 추천 코스 카드 스켈레톤 */
function RecommendedSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 pt-1">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="w-72 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-surface"
        >
          <SkeletonBlock className="h-32 w-full rounded-none" />
          <div className="p-3">
            <SkeletonBlock className="mb-2 h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 빈 상태 표시 컴포넌트 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-neutral-100 bg-neutral-50/50">
      <p className="text-sm text-neutral-400">{message}</p>
    </div>
  )
}

/**
 * RecommendedRoutes - 추천 코스 섹션
 * 코스 목록 페이지 상단에 공식 추천 + 인기 코스 표시
 * Requirements: 4.1, 4.2
 */
export function RecommendedRoutes() {
  const [data, setData] = useState<RecommendedData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommended() {
      try {
        const res = await fetch('/api/routes/recommended?limit=6')
        if (!res.ok) throw new Error('fetch failed')
        const json: RecommendedData = await res.json()
        setData(json)
      } catch {
        // 에러 시 빈 상태로 유지
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecommended()
  }, [])

  return (
    <div className="space-y-8">
      {/* 공식 추천 코스 섹션 */}
      <section>
        <h2 className="text-text-primary mb-3 flex items-center gap-2 text-lg font-bold">
          <AppIcon name="course-main" size="xl" />
          공식 추천 코스
        </h2>
        {isLoading ? (
          <RecommendedSkeleton />
        ) : data && data.official.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-1 pb-2 pt-1">
            {data.official.map((route) => (
              <div key={route.id} className="w-72 flex-shrink-0">
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="등록된 공식 추천 코스가 없습니다" />
        )}
      </section>

      {/* 인기 코스 섹션 */}
      <section>
        <h2 className="text-text-primary mb-3 flex items-center gap-2 text-lg font-bold">
          <AppIcon name="course-popular" size="xl" />
          인기 코스
        </h2>
        {isLoading ? (
          <RecommendedSkeleton />
        ) : data && data.popular.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto px-1 pb-2 pt-1">
            {data.popular.map((route) => (
              <div key={route.id} className="w-72 flex-shrink-0">
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="현재 집계된 인기 코스가 없습니다" />
        )}
      </section>
    </div>
  )
}
