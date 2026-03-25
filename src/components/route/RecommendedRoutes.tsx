'use client'

import { useState, useEffect } from 'react'
import { RouteCard } from '@/components/route/RouteCard'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

interface RecommendedData {
  official: Route[]
  popular: Route[]
}

/** 추천 코스 카드 스켈레톤 */
function RecommendedSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="w-72 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-white"
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
        // 에러 시 섹션 숨김
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecommended()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            ⭐ 공식 추천 코스
          </h2>
          <RecommendedSkeleton />
        </div>
      </div>
    )
  }

  // 데이터 없으면 섹션 숨김
  if (!data || (data.official.length === 0 && data.popular.length === 0)) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 공식 추천 코스 섹션 */}
      {data.official.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            ⭐ 공식 추천 코스
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.official.map((route) => (
              <div key={route.id} className="w-72 flex-shrink-0">
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 인기 코스 섹션 */}
      {data.popular.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold text-text-primary">
            🔥 인기 코스
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {data.popular.map((route) => (
              <div key={route.id} className="w-72 flex-shrink-0">
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
