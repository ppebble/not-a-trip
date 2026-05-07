'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useCourseProgressStore } from '@/stores/courseProgressStore'

/**
 * CourseProgressBanner - 코스 진행 중 글로벌 플로팅 배너
 *
 * 코스 진행 중 다른 페이지에서도 표시되는 하단 고정 배너.
 * 현재 코스명, 진행률, "코스로 돌아가기" 버튼, 닫기 버튼을 포함한다.
 *
 * 표시 조건:
 * - isNavigating === true
 * - isBannerDismissed === false
 * - 현재 경로가 /routes/{activeRouteId}가 아닌 경우
 *
 * @requirements 3.1, 3.2, 3.3, 3.4
 */
export function CourseProgressBanner() {
  const pathname = usePathname()
  const router = useRouter()

  const {
    isNavigating,
    activeRouteId,
    activeRoute,
    isBannerDismissed,
    dismissBanner,
  } = useCourseProgressStore()

  // 진행률 계산
  const checkedSpotIds = useCourseProgressStore((state) => state.checkedSpotIds)
  const availableSpots =
    activeRoute?.spots.filter((s) => s.isAvailable !== false) ?? []
  const progress =
    availableSpots.length > 0
      ? Math.round((checkedSpotIds.size / availableSpots.length) * 100)
      : 0

  // 표시 조건
  const shouldShow =
    isNavigating &&
    !isBannerDismissed &&
    activeRouteId !== null &&
    pathname !== `/routes/${activeRouteId}`

  if (!shouldShow) return null

  return (
    <div className="pb-safe fixed bottom-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-screen-md bg-primary text-white shadow-lg">
        <div className="flex items-center gap-3 px-4 py-3">
          {/* 코스명 + 진행률 */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {activeRoute?.name}
            </p>
            <p className="text-xs text-primary-100">{progress}% 완료</p>
          </div>

          {/* 코스로 돌아가기 버튼 */}
          <button
            onClick={() => router.push(`/routes/${activeRouteId}`)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary"
          >
            코스로 돌아가기
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={dismissBanner}
            className="rounded-full p-1 text-white/80 hover:text-white"
            aria-label="배너 닫기"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
