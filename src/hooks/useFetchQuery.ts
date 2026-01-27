import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { buildUrl } from '@/lib/api-routes'

interface FetchError extends Error {
  status?: number
  statusText?: string
}

interface UseFetchQueryParams<TData, TError = FetchError> extends Omit<
  UseQueryOptions<TData, TError>,
  'queryFn'
> {
  url: string
  params?: Record<string, string | number | boolean | undefined>
}

/**
 * fetch 기반 useQuery 래퍼 훅
 * 공통 fetch 로직을 추상화하여 코드 재사용성 향상
 */
export function useFetchQuery<TData>({
  queryKey,
  url,
  params,
  ...options
}: UseFetchQueryParams<TData>) {
  return useQuery<TData, FetchError>({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const fullUrl = buildUrl(url, params)
      const response = await fetch(fullUrl)

      if (!response.ok) {
        const error: FetchError = new Error(
          `Request failed: ${response.status} ${response.statusText}`
        )
        error.status = response.status
        error.statusText = response.statusText
        throw error
      }

      return response.json()
    },
    ...options,
  })
}
