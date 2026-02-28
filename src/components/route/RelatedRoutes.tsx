'use client'

import { useState, useEffect } from 'react'
import { RouteCard } from '@/components/route/RouteCard'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

interface RelatedRoutesProps {
  /** 관련 작품명 목록 */
  contentNames: string[]
}

interface RecommendedData {
  official: Route[]
  popular: Route[]
}

/**
 * RelatedRoutes - 작품 관련 추천 코스 섹션
 * 스팟 상세 페이지에서 해당 작품 관련 코스를 표시
 * Requirements: 4.3
 */
export function RelatedRoutes({ contentNames }: RelatedRoutesProps) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (contentNames.length === 0) {
      setIsLoading(false)
      return
    }

    async function fetchRelatedRoutes() {
      try {
        // 첫 번째 작품명으로 추천 코스 조회
        const res = await fetch(
          `/api/routes/recommended?contentName=${encodeURIComponent(contentNames[0])}&limit=4`
        )
        if (!res.ok) throw new Error('fetch failed')
        const data: RecommendedData = await res.json()

        // 공식 + 인기 합쳐서 중복 제거
        const allRoutes = [...data.official, ...data.popular]
        const unique = allRoutes.filter(
          (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
        )
        setRoutes(unique)
      } catch {
        // 에러 시 섹션 숨김
      } finally {
        setIsLoading(false)
      }
    }
    fetchRelatedRoutes()
  }, [contentNames])

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold text-gray-900 md:text-xl">
            🗺️ 관련 순례 코스
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div
                key={i}
                className="w-64 flex-shrink-0 overflow-hidden rounded-lg border border-navy-200 bg-white"
              >
                <SkeletonBlock className="h-28 w-full rounded-none" />
                <div className="p-3">
                  <SkeletonBlock className="mb-2 h-4 w-3/4" />
                  <SkeletonBlock className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (routes.length === 0) {
    return null
  }

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900 md:text-xl">
          🗺️ 관련 순례 코스
        </h2>
        <p className="mb-3 text-sm text-navy-500">
          「{contentNames[0]}」 관련 코스를 따라가보세요
        </p>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {routes.map((route) => (
            <div key={route.id} className="w-64 flex-shrink-0">
              <RouteCard route={route} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
