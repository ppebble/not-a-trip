'use client'

import { memo } from 'react'
import Link from 'next/link'
import { OptimizedImage } from '@/components/common'
import type { Route, RouteDifficulty } from '@/types/route'

interface RouteCardProps {
  route: Route
}

/** 난이도 라벨 및 색상 */
const DIFFICULTY_CONFIG: Record<
  RouteDifficulty,
  { label: string; color: string }
> = {
  easy: { label: '쉬움', color: 'bg-green-100 text-green-700' },
  moderate: { label: '보통', color: 'bg-yellow-100 text-yellow-700' },
  hard: { label: '어려움', color: 'bg-red-100 text-red-700' },
}

/** 소요시간 포맷 (분 → 시간+분) */
function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

/** 거리 포맷 (m → km) */
function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/**
 * RouteCard - 코스 카드 컴포넌트
 * 코스 목록에서 각 코스를 카드 형태로 표시
 * Requirements: 2.1
 */
export const RouteCard = memo(function RouteCard({ route }: RouteCardProps) {
  const difficulty = DIFFICULTY_CONFIG[route.difficulty]
  const availableSpots = route.spots.filter((s) => s.isAvailable !== false)

  return (
    <Link href={`/routes/${route.id}`} prefetch={false} className="block">
      <article className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-shadow hover:shadow-md">
        {/* 썸네일 영역 */}
        <div className="relative h-40 bg-surface">
          {route.spots[0]?.thumbnailUrl ? (
            <OptimizedImage
              src={route.spots[0].thumbnailUrl}
              alt={route.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-neutral-300">
              🗺️
            </div>
          )}

          {/* 공식 추천 뱃지 */}
          {route.isOfficial && (
            <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-semibold text-white shadow">
              ⭐ 공식 추천
            </span>
          )}

          {/* 난이도 뱃지 */}
          <span
            className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${difficulty.color}`}
          >
            {difficulty.label}
          </span>
        </div>

        {/* 정보 영역 */}
        <div className="p-4">
          <h3 className="mb-1 truncate text-base font-semibold text-main-text">
            {route.name}
          </h3>
          <p className="mb-3 line-clamp-2 text-sm text-sub-text">
            {route.description}
          </p>

          {/* 작품 태그 */}
          {route.relatedContentNames.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {route.relatedContentNames.slice(0, 3).map((name) => (
                <span
                  key={name}
                  className="rounded bg-primary-50 px-1.5 py-0.5 text-xs text-primary-600"
                >
                  {name}
                </span>
              ))}
              {route.relatedContentNames.length > 3 && (
                <span className="text-xs text-muted">
                  +{route.relatedContentNames.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 메타 정보 */}
          <div className="flex items-center gap-3 text-xs text-muted">
            <span title="스팟 수">📍 {availableSpots.length}곳</span>
            <span title="예상 소요시간">
              ⏱️ {formatDuration(route.estimatedDuration)}
            </span>
            <span title="총 거리">
              🚶 {formatDistance(route.totalDistance)}
            </span>
          </div>

          {/* 하단: 북마크/완주 수 + 작성자 */}
          <div className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3">
            <div className="flex items-center gap-3 text-xs text-muted">
              <span>🔖 {route.bookmarkCount}</span>
              <span>🏆 {route.completionCount}</span>
            </div>
            <span className="text-xs text-muted">{route.authorName}</span>
          </div>
        </div>
      </article>
    </Link>
  )
})
