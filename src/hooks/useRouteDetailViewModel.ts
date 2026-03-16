import { useQuery } from '@tanstack/react-query'
import { API_ROUTES } from '@/lib/api-routes'
import { routeKeys } from '@/hooks/useRouteQueries'
import type { Route } from '@/types/route'

// ── Types ───────────────────────────────────────────────────

interface UseRouteDetailViewModelProps {
  routeId: string
}

interface UseRouteDetailViewModelReturn {
  route: Route | null
  isLoading: boolean
  error: string | null
}

// ── Hook ────────────────────────────────────────────────────

/**
 * 코스 상세 데이터 패칭 ViewModel 훅
 * useState/useEffect 기반 수동 fetch를 React Query로 전환
 * Requirements: 7.1, 7.2
 */
export function useRouteDetailViewModel({
  routeId,
}: UseRouteDetailViewModelProps): UseRouteDetailViewModelReturn {
  const { data, isLoading, error } = useQuery({
    queryKey: routeKeys.detail(routeId),
    queryFn: async (): Promise<Route> => {
      const res = await fetch(API_ROUTES.ROUTES.DETAIL(routeId))
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || '코스를 불러올 수 없습니다')
      }
      return res.json()
    },
    enabled: !!routeId,
  })

  return {
    route: data ?? null,
    isLoading,
    error: error ? error.message : null,
  }
}
