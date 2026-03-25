'use client'

import { useRelatedRoutes } from '@/hooks/useRouteQueries'
import { RouteCard } from '@/components/route/RouteCard'
import { SkeletonBlock } from '@/components/common/SkeletonUI'

interface RelatedRoutesProps {
  /** 관련 작품명 목록 */
  contentNames: string[]
}

/**
 * RelatedRoutes - 작품 관련 추천 코스 섹션
 * 스팟 상세 페이지에서 해당 작품 관련 코스를 표시
 * Requirements: 4.3
 */
export function RelatedRoutes({ contentNames }: RelatedRoutesProps) {
  const { data: routes = [], isLoading } = useRelatedRoutes(contentNames)

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-lg bg-white shadow-md">
        <div className="p-4 md:p-6">
          <h2 className="mb-4 text-lg font-bold text-neutral-900 md:text-xl">
            🗺️ 관련 순례 코스
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {Array.from({ length: 2 }, (_, i) => (
              <div
                key={i}
                className="w-64 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-white"
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

  if (routes.length === 0) return null

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      <div className="p-4 md:p-6">
        <h2 className="mb-4 text-lg font-bold text-neutral-900 md:text-xl">
          🗺️ 관련 순례 코스
        </h2>
        <p className="mb-3 text-sm text-muted">
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
