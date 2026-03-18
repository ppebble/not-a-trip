import { useSuspenseQuery } from '@tanstack/react-query'
import { API_ROUTES } from '@/lib/api-routes'
import { routeKeys } from '@/hooks/useRouteQueries'
import type { Route } from '@/types/route'

// ── Shared queryFn ──────────────────────────────────────────

function routeDetailQueryFn(routeId: string) {
  return async (): Promise<Route> => {
    const res = await fetch(API_ROUTES.ROUTES.DETAIL(routeId))
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error || '코스를 불러올 수 없습니다')
    }
    return res.json()
  }
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * Suspense 모드 코스 상세 훅
 * AsyncBoundary 내부에서 사용 — 로딩/에러 상태를 Suspense/ErrorBoundary로 위임
 * Requirements: 2.4, 2.5, 7.1, 7.2
 */
export function useRouteDetailSuspense(routeId: string) {
  return useSuspenseQuery({
    queryKey: routeKeys.detail(routeId),
    queryFn: routeDetailQueryFn(routeId),
  })
}
