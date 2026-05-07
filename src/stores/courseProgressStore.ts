/**
 * courseProgressStore - 코스 진행 상태 관리
 *
 * 현재 진행 중인 코스, 목표 스팟 인덱스, 인증 완료 스팟 목록 관리
 * startRoute 시 기존 Check-in 기록을 조회하여 자동 반영
 * persist 미들웨어로 브라우저 새로고침 후에도 상태 유지
 *
 * @requirements 2.1, 2.3, 3.1, 3.4, 3.5
 */

import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import type { Route } from '@/types/route'

interface CourseProgressState {
  /** 현재 진행 중인 코스 ID */
  activeRouteId: string | null
  /** 현재 진행 중인 코스 데이터 */
  activeRoute: Route | null
  /** 현재 목표 스팟 인덱스 (0-based) */
  currentSpotIndex: number
  /** 인증 완료한 스팟 ID Set */
  checkedSpotIds: Set<string>
  /** 코스 시작 시간 */
  startedAt: Date | null
  /** 네비게이션 활성 여부 */
  isNavigating: boolean
  /** 배너 일시 숨김 여부 (dismiss 시 true) */
  isBannerDismissed: boolean
}

interface CourseProgressActions {
  /**
   * 코스 시작
   * 기존 Check-in 기록(GET /api/checkins?userId=...)을 조회하여
   * 코스 내 이미 인증된 스팟을 checkedSpotIds에 자동 포함
   */
  startRoute: (route: Route, userId: string) => Promise<void>
  /**
   * 스팟 인증 완료 처리
   * ⚠️ 반드시 Check-in API(POST /api/checkins) 성공 후에만 호출
   * 내부적으로 advanceToNextUnchecked()를 자동 호출
   */
  checkInSpot: (spotId: string) => void
  /**
   * 다음 미인증 스팟으로 자동 이동
   * 현재 인덱스 이후부터 순환 탐색하여 다음 미인증 유효 스팟 찾기
   * 모든 스팟 인증 완료 시 인덱스 유지 (완주 상태)
   */
  advanceToNextUnchecked: () => void
  /** 다음 스팟으로 이동 */
  moveToNextSpot: () => void
  /** 코스 종료 */
  endRoute: () => void
  /** 전체 상태 리셋 */
  resetProgress: () => void
  /** 배너 일시 숨김 */
  dismissBanner: () => void
  /** 배너 다시 표시 */
  showBanner: () => void
}

type CourseProgressStore = CourseProgressState & CourseProgressActions

/** localStorage 직렬화 형태 */
interface PersistedCourseProgress {
  activeRouteId: string | null
  activeRoute: Route | null
  currentSpotIndex: number
  checkedSpotIds: string[] // Set → Array로 직렬화
  startedAt: string | null // Date → ISO string
  isNavigating: boolean
  isBannerDismissed: boolean
}

export const useCourseProgressStore = create<CourseProgressStore>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        activeRouteId: null,
        activeRoute: null,
        currentSpotIndex: 0,
        checkedSpotIds: new Set<string>(),
        startedAt: null,
        isNavigating: false,
        isBannerDismissed: false,

        startRoute: async (route: Route, userId: string) => {
          // 기존 Check-in 기록 조회하여 이미 인증된 스팟 자동 포함
          const checkedSpotIds = new Set<string>()

          try {
            const res = await fetch(
              `/api/checkins?userId=${encodeURIComponent(userId)}&limit=1000`
            )
            if (res.ok) {
              const data = await res.json()
              const checkedSpotIdSet = new Set(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data.checkins.map((c: any) => c.spotId as string)
              )
              // 코스 내 스팟 중 이미 인증된 것만 포함
              for (const spot of route.spots) {
                if (checkedSpotIdSet.has(spot.spotId)) {
                  checkedSpotIds.add(spot.spotId)
                }
              }
            }
          } catch {
            // 오프라인 등 실패 시 빈 Set으로 시작
          }

          set(
            {
              activeRouteId: route.id,
              activeRoute: route,
              currentSpotIndex: 0,
              checkedSpotIds,
              startedAt: new Date(),
              isNavigating: true,
              isBannerDismissed: false,
            },
            false,
            'courseProgress/startRoute'
          )
        },

        checkInSpot: (spotId: string) => {
          const { checkedSpotIds } = get()
          const next = new Set(checkedSpotIds)
          next.add(spotId)
          set({ checkedSpotIds: next }, false, 'courseProgress/checkInSpot')
          // 체크인 후 자동으로 다음 미인증 스팟으로 이동
          get().advanceToNextUnchecked()
        },

        advanceToNextUnchecked: () => {
          const { activeRoute, currentSpotIndex, checkedSpotIds } = get()
          if (!activeRoute) return

          // isAvailable이 false가 아닌 유효 스팟만 필터링
          const availableSpots = activeRoute.spots.filter(
            (s) => s.isAvailable !== false
          )
          const currentIdx = currentSpotIndex

          // 현재 인덱스 이후부터 순환 탐색
          for (let i = currentIdx + 1; i < availableSpots.length; i++) {
            if (!checkedSpotIds.has(availableSpots[i].spotId)) {
              // 원본 spots 배열 기준 인덱스 찾기
              const originalIdx = activeRoute.spots.findIndex(
                (s) => s.spotId === availableSpots[i].spotId
              )
              if (originalIdx !== -1) {
                set(
                  { currentSpotIndex: originalIdx },
                  false,
                  'courseProgress/advanceToNextUnchecked'
                )
              }
              return
            }
          }

          // 현재 인덱스 이전도 탐색 (순환)
          for (let i = 0; i < currentIdx; i++) {
            if (!checkedSpotIds.has(availableSpots[i].spotId)) {
              const originalIdx = activeRoute.spots.findIndex(
                (s) => s.spotId === availableSpots[i].spotId
              )
              if (originalIdx !== -1) {
                set(
                  { currentSpotIndex: originalIdx },
                  false,
                  'courseProgress/advanceToNextUnchecked'
                )
              }
              return
            }
          }

          // 모든 스팟 인증 완료 → 인덱스 유지 (완주 상태)
        },

        moveToNextSpot: () => {
          const { currentSpotIndex, activeRoute } = get()
          if (!activeRoute) return
          const maxIndex = activeRoute.spots.length - 1
          if (currentSpotIndex < maxIndex) {
            set(
              { currentSpotIndex: currentSpotIndex + 1 },
              false,
              'courseProgress/moveToNextSpot'
            )
          }
        },

        endRoute: () => {
          set(
            {
              isNavigating: false,
            },
            false,
            'courseProgress/endRoute'
          )
        },

        resetProgress: () => {
          set(
            {
              activeRouteId: null,
              activeRoute: null,
              currentSpotIndex: 0,
              checkedSpotIds: new Set<string>(),
              startedAt: null,
              isNavigating: false,
              isBannerDismissed: false,
            },
            false,
            'courseProgress/resetProgress'
          )
        },

        dismissBanner: () => {
          set(
            { isBannerDismissed: true },
            false,
            'courseProgress/dismissBanner'
          )
        },

        showBanner: () => {
          set({ isBannerDismissed: false }, false, 'courseProgress/showBanner')
        },
      }),
      {
        name: 'course-progress',
        storage: createJSONStorage(() =>
          // SSR 환경에서 localStorage 접근 방지
          typeof window !== 'undefined'
            ? localStorage
            : {
                getItem: () => null,
                setItem: () => {},
                removeItem: () => {},
              }
        ),
        partialize: (state): PersistedCourseProgress => ({
          activeRouteId: state.activeRouteId,
          activeRoute: state.activeRoute,
          currentSpotIndex: state.currentSpotIndex,
          checkedSpotIds: Array.from(state.checkedSpotIds),
          startedAt: state.startedAt?.toISOString() ?? null,
          isNavigating: state.isNavigating,
          isBannerDismissed: state.isBannerDismissed,
        }),
        // rehydrate 시 Array → Set, string → Date 변환
        merge: (persistedState, currentState) => {
          const persisted = persistedState as PersistedCourseProgress
          return {
            ...currentState,
            ...persisted,
            checkedSpotIds: new Set<string>(persisted.checkedSpotIds ?? []),
            startedAt: persisted.startedAt
              ? new Date(persisted.startedAt)
              : null,
          }
        },
      }
    ),
    { name: 'course-progress-store' }
  )
)

// Selectors
export const useIsNavigating = () =>
  useCourseProgressStore((state) => state.isNavigating)
export const useActiveRoute = () =>
  useCourseProgressStore((state) => state.activeRoute)
export const useCurrentSpotIndex = () =>
  useCourseProgressStore((state) => state.currentSpotIndex)
export const useCheckedSpotIds = () =>
  useCourseProgressStore((state) => state.checkedSpotIds)
export const useIsBannerDismissed = () =>
  useCourseProgressStore((state) => state.isBannerDismissed)
