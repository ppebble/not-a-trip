import { useQuery } from '@tanstack/react-query'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'
import type { Route } from '@/types/route'

// ── Response Types ──────────────────────────────────────────

interface RoutesResponse {
  routes: Route[]
  total: number
  page: number
  totalPages: number
}

interface RecommendedRoutesResponse {
  official: Route[]
  popular: Route[]
}

// ── Query Key Factory ───────────────────────────────────────

export const routeKeys = {
  all: ['routes'] as const,
  lists: () => [...routeKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...routeKeys.lists(), filters] as const,
  related: (contentName: string) =>
    [...routeKeys.all, 'related', contentName] as const,
}

// ── Hooks ───────────────────────────────────────────────────

/**
 * 코스 목록 조회 훅 (RouteListContent용)
 * Requirements: 8.3
 */
export function useRouteList(
  filters: {
    sort: string
    contentName?: string
    regionTag?: string
    minDuration?: number
    maxDuration?: number
  },
  page: number
) {
  return useQuery({
    queryKey: routeKeys.list({ ...filters, page }),
    queryFn: async (): Promise<RoutesResponse> => {
      const url = buildUrl(API_ROUTES.ROUTES.BASE, {
        sort: filters.sort,
        contentName: filters.contentName || undefined,
        regionTag: filters.regionTag || undefined,
        minDuration: filters.minDuration,
        maxDuration: filters.maxDuration,
        page,
        limit: 12,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('코스 목록 조회 실패')
      return res.json()
    },
  })
}

/**
 * 관련 코스 조회 훅 (RelatedRoutes용)
 * Requirements: 8.3
 */
export function useRelatedRoutes(contentNames: string[]) {
  const contentName = contentNames[0] || ''
  return useQuery({
    queryKey: routeKeys.related(contentName),
    queryFn: async (): Promise<Route[]> => {
      const url = buildUrl(API_ROUTES.ROUTES.RECOMMENDED, {
        contentName,
        limit: 4,
      })
      const res = await fetch(url)
      if (!res.ok) throw new Error('관련 코스 조회 실패')
      const data: RecommendedRoutesResponse = await res.json()

      // 공식 + 인기 합쳐서 중복 제거
      const allRoutes = [...data.official, ...data.popular]
      return allRoutes.filter(
        (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i
      )
    },
    enabled: contentNames.length > 0,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
}
