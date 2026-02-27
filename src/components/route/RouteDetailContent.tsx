'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import type { Route, RouteDifficulty } from '@/types/route'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-navy-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-300 border-t-navy-600" />
    </div>
  ),
})

interface RouteDetailContentProps {
  route: Route
}

const DIFFICULTY_LABEL: Record<RouteDifficulty, string> = {
  easy: '🟢 쉬움',
  moderate: '🟡 보통',
  hard: '🔴 어려움',
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}분`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${meters}m`
  return `${(meters / 1000).toFixed(1)}km`
}

/** 외부 지도 앱 URL 생성 */
function getExternalMapUrl(
  lat: number,
  lng: number,
  name: string,
  app: 'google' | 'yahoo'
): string {
  if (app === 'google') {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`
  }
  return `https://map.yahoo.co.jp/route/walk?lat=${lat}&lon=${lng}&name=${encodeURIComponent(name)}`
}

/**
 * RouteDetailContent - 코스 상세 콘텐츠
 * RouteMap + 스팟 순서 목록 + 거리/시간 + 코스 시작/저장 버튼
 * Requirements: 1.4, 2.3, 2.4, 3.1
 */
export function RouteDetailContent({ route }: RouteDetailContentProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(route.bookmarkCount)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const availableSpots = route.spots.filter((s) => s.isAvailable !== false)

  /** 북마크 토글 */
  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    if (isBookmarking) return
    setIsBookmarking(true)

    try {
      const res = await fetch(`/api/routes/${route.id}/bookmark`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setIsBookmarked(data.bookmarked)
        setBookmarkCount((prev) => prev + (data.bookmarked ? 1 : -1))
      }
    } catch {
      // 에러 무시
    } finally {
      setIsBookmarking(false)
    }
  }, [isAuthenticated, isBookmarking, route.id])

  /** 코스 시작 */
  const handleStartRoute = useCallback(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }
    // 코스 상세 페이지에서 따라가기 모드 활성화 (Task 9에서 구현)
    // 현재는 알림만 표시
    alert('따라가기 모드는 준비 중입니다')
  }, [isAuthenticated])

  return (
    <div className="space-y-6">
      {/* 코스 기본 정보 */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {route.isOfficial && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  ⭐ 공식 추천
                </span>
              )}
              <span className="text-sm text-navy-400">
                {DIFFICULTY_LABEL[route.difficulty]}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-navy-900">{route.name}</h1>
            <p className="mt-2 text-sm text-navy-500">{route.description}</p>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm text-navy-500">
          <span>📍 {availableSpots.length}곳</span>
          <span>⏱️ {formatDuration(route.estimatedDuration)}</span>
          <span>🚶 {formatDistance(route.totalDistance)}</span>
          <span>🔖 {bookmarkCount}</span>
          <span>🏆 {route.completionCount}</span>
        </div>

        {/* 작품 태그 */}
        {route.relatedContentNames.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {route.relatedContentNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs text-navy-600"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* 지역 태그 */}
        {route.regionTag && (
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600">
            📍 {route.regionTag}
          </span>
        )}

        {/* 작성자 정보 */}
        <div className="mt-4 border-t border-navy-100 pt-4 text-sm text-navy-400">
          코스 제작: {route.authorName}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={handleStartRoute}
          className="flex-1 rounded-lg bg-navy-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700"
        >
          🚶 코스 시작
        </button>
        <button
          onClick={handleBookmark}
          disabled={isBookmarking}
          className={`rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-colors ${
            isBookmarked
              ? 'border-amber-400 bg-amber-50 text-amber-700'
              : 'border-navy-200 bg-white text-navy-600 hover:bg-navy-50'
          }`}
        >
          {isBookmarked ? '🔖 저장됨' : '🔖 저장'}
        </button>
        {user && route.authorId === user.id && (
          <button
            onClick={() => router.push(`/routes/${route.id}/edit`)}
            className="rounded-lg border-2 border-navy-200 bg-white px-4 py-3 text-sm text-navy-600 transition-colors hover:bg-navy-50"
          >
            ✏️ 수정
          </button>
        )}
      </div>

      {/* 코스 지도 */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-navy-900">코스 지도</h2>
        <RouteMap spots={route.spots} />
      </div>

      {/* 스팟 순서 목록 */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-navy-900">
          코스 순서 ({availableSpots.length}곳)
        </h2>
        <ol className="space-y-0">
          {route.spots.map((spot, idx) => {
            const isUnavailable = spot.isAvailable === false
            return (
              <li key={spot.spotId}>
                {/* 이동 거리/시간 표시 (첫 스팟 제외) */}
                {idx > 0 && spot.distanceFromPrev && (
                  <div className="flex items-center gap-2 py-2 pl-8">
                    <div className="h-4 w-px bg-navy-200" />
                    <span className="text-xs text-navy-400">
                      ↓ {formatDistance(spot.distanceFromPrev)}
                      {spot.walkTimeFromPrev &&
                        ` · 도보 약 ${spot.walkTimeFromPrev}분`}
                    </span>
                  </div>
                )}

                {/* 스팟 카드 */}
                <div
                  className={`flex items-center gap-3 rounded-lg p-3 ${
                    isUnavailable ? 'bg-gray-50 opacity-60' : 'hover:bg-navy-50'
                  }`}
                >
                  {/* 순서 번호 */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                      isUnavailable ? 'bg-gray-400' : 'bg-navy-600'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* 썸네일 */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-navy-100">
                    {spot.thumbnailUrl ? (
                      <img
                        src={spot.thumbnailUrl}
                        alt={spot.spotName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-navy-300">
                        📍
                      </div>
                    )}
                  </div>

                  {/* 스팟 정보 */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isUnavailable
                          ? 'text-gray-400 line-through'
                          : 'text-navy-900'
                      }`}
                    >
                      {spot.spotName}
                    </p>
                    {isUnavailable && (
                      <p className="text-xs text-red-400">소실된 스팟</p>
                    )}
                    {spot.note && (
                      <p className="truncate text-xs text-navy-400">
                        {spot.note}
                      </p>
                    )}
                  </div>

                  {/* 외부 지도 앱 버튼 */}
                  {!isUnavailable && (
                    <div className="flex flex-shrink-0 gap-1">
                      <a
                        href={getExternalMapUrl(
                          spot.coordinates.lat,
                          spot.coordinates.lng,
                          spot.spotName,
                          'google'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-navy-50 px-2 py-1 text-xs text-navy-500 transition-colors hover:bg-navy-100"
                        title="구글맵에서 경로 탐색"
                      >
                        🗺️
                      </a>
                      <a
                        href={getExternalMapUrl(
                          spot.coordinates.lat,
                          spot.coordinates.lng,
                          spot.spotName,
                          'yahoo'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded bg-navy-50 px-2 py-1 text-xs text-navy-500 transition-colors hover:bg-navy-100"
                        title="야후재팬맵에서 경로 탐색"
                      >
                        🇯🇵
                      </a>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* 로그인 모달 */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        title="로그인이 필요합니다"
        description="코스 시작 및 저장 기능을 사용하려면 로그인이 필요합니다."
        onConfirm={() => router.push('/auth/signin')}
      />
    </div>
  )
}
