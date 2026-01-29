import { useState, useEffect, useRef } from 'react'
import { SpotCategory } from '@/types'
import { API_ROUTES, buildUrl } from '@/lib/api-routes'

/**
 * 자동완성 항목 인터페이스
 */
export interface AutocompleteItem {
  name: string
  category: SpotCategory
  count: number
}

/**
 * API 응답 인터페이스
 */
interface ContentNamesResponse {
  items: AutocompleteItem[]
  total: number
}

/**
 * useAutocomplete 훅 반환 타입
 */
export interface UseAutocompleteReturn {
  suggestions: AutocompleteItem[]
  isLoading: boolean
  error: Error | null
}

/**
 * 자동완성 커스텀 훅
 * Requirements: 2.1
 * - 2글자 이상 입력 시 API 호출
 * - 300ms 디바운스 적용
 * - suggestions, isLoading, error 반환
 *
 * @param query - 검색어
 * @returns UseAutocompleteReturn
 */
export function useAutocomplete(query: string): UseAutocompleteReturn {
  const [suggestions, setSuggestions] = useState<AutocompleteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // 디바운스 타이머 ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  // 진행 중인 요청 취소를 위한 AbortController ref
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // 이전 디바운스 타이머 취소
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // 2글자 미만이면 빈 배열 반환 (Requirements 2.1)
    if (query.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      setError(null)
      return
    }

    // 로딩 상태 시작
    setIsLoading(true)

    // 300ms 디바운스 적용
    debounceTimerRef.current = setTimeout(async () => {
      // 이전 요청 취소
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // 새 AbortController 생성
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      try {
        const url = buildUrl(API_ROUTES.CONTENT_NAMES, { search: query })
        const response = await fetch(url, {
          signal: abortController.signal,
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch suggestions: ${response.status} ${response.statusText}`
          )
        }

        const data: ContentNamesResponse = await response.json()
        setSuggestions(data.items)
        setError(null)
      } catch (err) {
        // AbortError는 무시 (의도적인 취소)
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }

        // 에러 로깅 및 상태 업데이트
        // eslint-disable-next-line no-console
        console.error('Autocomplete fetch error:', err)
        setSuggestions([])
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        // AbortError가 아닌 경우에만 로딩 상태 해제
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 300)

    // 클린업: 컴포넌트 언마운트 또는 query 변경 시
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [query])

  return { suggestions, isLoading, error }
}
