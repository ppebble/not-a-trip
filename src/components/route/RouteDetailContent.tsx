'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AppIcon } from '@/components/common/AppIcon'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { useRouteNavigation } from '@/hooks/useRouteNavigation'
import ShareButton from '@/components/common/ShareButton'
import { formatRouteShareText } from '@/lib/share-utils'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { GuidePanel } from '@/components/route/GuidePanel'
import { CompletionEffect } from '@/components/route/CompletionEffect'
import { OptimizedImage } from '@/components/common'
import OnboardingTour from '@/components/common/OnboardingTour'
import { useOnboarding } from '@/hooks/useOnboarding'
import { ROUTE_DETAIL_STEPS } from '@/lib/tour-config'
import type { Route, RouteDifficulty } from '@/types/route'
import {
  getTravelMode,
  getTravelModeLabel,
  getTravelModeIcon,
  getGoogleMapsDirectionsUrl,
  calculateStartToFirstSpot,
} from '@/lib/route-utils'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[400px] items-center justify-center rounded-lg bg-neutral-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary" />
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

/**
 * RouteDetailContent - 코스 상세 콘텐츠
 * RouteMap + 스팟 순서 목록 + 거리/시간 + 코스 시작/저장 버튼
 * 단일 스팟(1개) 코스도 정상 표시: 코스 순서 섹션에 단일 스팟 안내 메시지 포함
 * Requirements: 1.4, 1.7, 2.3, 2.4, 3.1
 */
export function RouteDetailContent({ route }: RouteDetailContentProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(route.bookmarkCount)
  const [isBookmarking, setIsBookmarking] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const nav = useRouteNavigation()
  const { isActive, currentStep, next, skip, dismiss } = useOnboarding(
    ROUTE_DETAIL_STEPS,
    'route-detail'
  )

  const [showCompletionEffect, setShowCompletionEffect] = useState(false)

  const availableSpots = route.spots.filter((s) => s.isAvailable !== false)

  // 완주 감지 시 이펙트 표시
  const completionShownRef = useRef(false)
  useEffect(() => {
    if (nav.isCompleted && nav.isNavigating && !completionShownRef.current) {
      completionShownRef.current = true
      setShowCompletionEffect(true)
    }
    if (!nav.isNavigating) {
      completionShownRef.current = false
    }
  }, [nav.isCompleted, nav.isNavigating])

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
  const handleStartRoute = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setShowLoginModal(true)
      return
    }
    await nav.startRoute(route, user.id)
  }, [isAuthenticated, user, nav, route])

  /** 스팟 인증 (Check-in 페이지로 이동) */
  const handleCheckIn = useCallback(
    (spotId: string) => {
      router.push(`/spots/${spotId}`)
    },
    [router]
  )

  return (
    <div className="space-y-6">
      {/* 코스 기본 정보 */}
      <div className="rounded-lg bg-surface p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {route.isOfficial && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  <AppIcon name="official" size={12} />
                  공식 추천
                </span>
              )}
              <span className="text-sm text-muted">
                {DIFFICULTY_LABEL[route.difficulty]}
              </span>
            </div>
            <h1 className="text-text-primary text-2xl font-bold">
              {route.name}
            </h1>
            <p className="text-text-secondary mt-2 text-sm">
              {route.description}
            </p>
          </div>
        </div>

        {/* 메타 정보 */}
        <div className="text-text-secondary mb-4 flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">
            <AppIcon name="spot" size={16} />
            {availableSpots.length}곳
          </span>
          <span className="flex items-center gap-1">
            <AppIcon name="duration" size={16} />
            {formatDuration(route.estimatedDuration)}
          </span>
          {route.totalDistance > 0 && (
            <span className="flex items-center gap-1">
              <AppIcon name="distance" size={16} />
              {formatDistance(route.totalDistance)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <AppIcon name="bookmark" size={16} />
            {bookmarkCount}
          </span>
          <span className="flex items-center gap-1">
            <AppIcon name="completion" size={16} />
            {route.completionCount}
          </span>
        </div>

        {/* 작품 태그 */}
        {route.relatedContentNames.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {route.relatedContentNames.map((name) => (
              <span
                key={name}
                className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs text-primary-600"
              >
                {name}
              </span>
            ))}
          </div>
        )}

        {/* 지역 태그 */}
        {route.regionTags && route.regionTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {route.regionTags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-secondary-50 px-2.5 py-0.5 text-xs text-secondary-600"
              >
                <AppIcon name="location" size={12} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 작성자 정보 */}
        <div className="mt-4 border-t border-border pt-4 text-sm text-muted">
          코스 제작: {route.authorName}
        </div>
      </div>

      {/* 액션 버튼 */}
      {!nav.isNavigating && (
        <div className="flex gap-3">
          <button
            onClick={handleStartRoute}
            data-tour="route-start-btn"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
          >
            <AppIcon name="route" size={18} />
            코스 시작
          </button>
          <button
            onClick={handleBookmark}
            disabled={isBookmarking}
            className={`flex items-center justify-center gap-2 rounded-lg border-2 px-6 py-3 text-sm font-semibold transition-colors ${
              isBookmarked
                ? 'border-amber-400 bg-amber-50 text-amber-700'
                : 'border-border bg-surface text-primary hover:bg-primary-50'
            }`}
          >
            <AppIcon
              name="bookmark"
              size={18}
              className={isBookmarked ? '' : 'opacity-70'}
            />
            {isBookmarked ? '저장됨' : '저장'}
          </button>
          {user && route.authorId === user.id && (
            <button
              onClick={() => router.push(`/routes/${route.id}/edit`)}
              className="rounded-lg border-2 border-border bg-surface px-4 py-3 text-sm text-primary transition-colors hover:bg-primary-50"
            >
              ✏️ 수정
            </button>
          )}
          <ShareButton
            title={route.name}
            text={formatRouteShareText(route.name)}
            variant="icon"
          />
        </div>
      )}

      {/* 코스 지도 */}
      <div className="rounded-lg bg-surface p-4 shadow-sm">
        <h2 className="text-text-primary mb-3 text-lg font-semibold">
          코스 지도
        </h2>
        <RouteMap
          spots={route.spots}
          startPoint={route.startPoint}
          currentPosition={nav.isNavigating ? nav.currentPosition : undefined}
          currentSpotIndex={nav.isNavigating ? nav.currentSpotIndex : undefined}
          checkedSpotIds={nav.isNavigating ? nav.checkedSpotIds : undefined}
        />
      </div>

      {/* 스팟 순서 목록 */}
      <div
        className="rounded-lg bg-surface p-4 shadow-sm"
        data-tour="route-spot-list"
      >
        <h2 className="text-text-primary mb-3 text-lg font-semibold">
          코스 순서 ({availableSpots.length}곳)
        </h2>
        {availableSpots.length === 1 && (
          <p className="mb-3 text-center text-xs text-primary">
            📍 단일 스팟 코스입니다. 해당 장소를 방문하여 인증해보세요!
          </p>
        )}
        <ol className="space-y-0">
          {/* 시작 지점 표시 */}
          {route.startPoint &&
            route.spots.length > 0 &&
            (() => {
              const info = calculateStartToFirstSpot(
                route.startPoint,
                route.spots[0]
              )
              const mode = info ? getTravelMode(info.distance) : null
              return (
                <li>
                  <div className="flex items-center gap-3 rounded-lg bg-primary-50 p-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary p-1.5 text-sm text-white">
                      <AppIcon name="location" size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text-primary text-sm font-medium">
                        {route.startPoint.name}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {route.startPoint.address}
                      </p>
                    </div>
                  </div>
                  {info && mode && (
                    <div className="flex items-center gap-2 py-2 pl-8">
                      <div className="h-4 w-px bg-neutral-200" />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted">
                          ↓ {formatDistance(info.distance)}
                          {' · '}
                          {getTravelModeIcon(mode)}{' '}
                          {mode === 'walking' && info.walkTime !== null
                            ? `도보 약 ${info.walkTime}분`
                            : getTravelModeLabel(mode)}
                        </span>
                        {mode !== 'walking' && (
                          <a
                            href={getGoogleMapsDirectionsUrl(
                              route.startPoint.coordinates.lat,
                              route.startPoint.coordinates.lng,
                              route.spots[0].coordinates.lat,
                              route.spots[0].coordinates.lng,
                              mode
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-100"
                          >
                            <AppIcon name="map" size={12} />
                            구글맵 길찾기
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </li>
              )
            })()}

          {route.spots.map((spot, idx) => {
            const isUnavailable = spot.isAvailable === false
            return (
              <li key={spot.spotId}>
                {/* 이동 거리/시간 표시 (첫 스팟 제외) */}
                {idx > 0 && spot.distanceFromPrev && (
                  <div className="flex items-center gap-2 py-2 pl-8">
                    <div className="h-4 w-px bg-neutral-200" />
                    {(() => {
                      const mode = getTravelMode(spot.distanceFromPrev)
                      const prev = route.spots[idx - 1]
                      return (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted">
                            ↓ {formatDistance(spot.distanceFromPrev)}
                            {' · '}
                            {getTravelModeIcon(mode)}{' '}
                            {mode === 'walking' && spot.walkTimeFromPrev
                              ? `도보 약 ${spot.walkTimeFromPrev}분`
                              : getTravelModeLabel(mode)}
                          </span>
                          {mode !== 'walking' && prev.isAvailable !== false && (
                            <a
                              href={getGoogleMapsDirectionsUrl(
                                prev.coordinates.lat,
                                prev.coordinates.lng,
                                spot.coordinates.lat,
                                spot.coordinates.lng,
                                mode
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary-100"
                            >
                              <AppIcon name="map" size={12} />
                              구글맵 길찾기
                            </a>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {/* 스팟 카드 */}
                <div
                  className={`flex items-center gap-3 rounded-lg p-3 ${
                    isUnavailable
                      ? 'bg-neutral-50 opacity-60'
                      : 'hover:bg-surface'
                  }`}
                >
                  {/* 순서 번호 */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
                      isUnavailable ? 'bg-neutral-400' : 'bg-primary'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* 썸네일 */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
                    {spot.thumbnailUrl ? (
                      <OptimizedImage
                        src={spot.thumbnailUrl}
                        alt={spot.spotName}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg text-neutral-300">
                        <AppIcon name="spot" size={24} className="opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* 스팟 정보 */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isUnavailable
                          ? 'text-neutral-400 line-through'
                          : 'text-text-primary'
                      }`}
                    >
                      {spot.spotName}
                    </p>
                    {isUnavailable && (
                      <p className="text-xs text-red-400">소실된 스팟</p>
                    )}
                    {spot.note && (
                      <p className="truncate text-xs text-muted">{spot.note}</p>
                    )}
                  </div>

                  {/* 외부 지도 앱 버튼 - 제거됨 (코스 상세에서 불필요) */}
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
        onClose={() => setShowLoginModal(false)}
      />

      {/* 가이드 모드 하단 패널 */}
      {nav.isNavigating && nav.activeRoute && (
        <GuidePanel
          spots={nav.activeRoute.spots}
          checkedSpotIds={nav.checkedSpotIds}
          currentSpotIndex={nav.currentSpotIndex}
          progress={nav.progress}
          currentPosition={nav.currentPosition}
          accuracy={nav.accuracy}
          onCheckIn={handleCheckIn}
          onEndRoute={nav.endRoute}
          isCompleted={nav.isCompleted}
        />
      )}

      {/* 네비게이션 모드 시 하단 패널 높이만큼 여백 */}
      {nav.isNavigating && <div className="h-44" />}

      {/* 완주 축하 이펙트 */}
      <CompletionEffect
        isVisible={showCompletionEffect}
        routeName={route.name}
        onClose={() => setShowCompletionEffect(false)}
      />

      {/* 온보딩 가이드 투어 */}
      <OnboardingTour
        steps={ROUTE_DETAIL_STEPS}
        isActive={isActive}
        currentStep={currentStep}
        onNext={next}
        onSkip={skip}
        onComplete={skip}
        onDismiss={dismiss}
      />
    </div>
  )
}
