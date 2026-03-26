'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Coordinates } from '@/types'

interface AddressSearchProps {
  onSelect: (address: string, coordinates: Coordinates) => void
  initialValue?: string
}

interface AddressResult {
  address: string
  placeType?: string
  coordinates: Coordinates
}

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  type: string
  class: string
}

/**
 * 주소 검색 컴포넌트
 *
 * Requirements:
 * - 4.4: 주소 검색/자동완성 기능
 * - 4.5: 선택 시 좌표 자동 설정
 *
 * Nominatim (OpenStreetMap) API 사용 - 전세계 주소 검색 지원
 */
export function AddressSearch({
  onSelect,
  initialValue = '',
}: AddressSearchProps) {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<AddressResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // initialValue가 변경되면 query 상태 업데이트 (수정 페이지에서 기존 주소 표시)
  useEffect(() => {
    if (initialValue && initialValue !== query) {
      setQuery(initialValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Nominatim 주소 검색 API 호출
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Nominatim API 사용 (OpenStreetMap)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'ko,en',
          },
        }
      )

      if (!response.ok) {
        throw new Error('주소 검색에 실패했습니다')
      }

      const data: NominatimResult[] = await response.json()

      const addressResults: AddressResult[] = data.map((item) => ({
        address: item.display_name,
        placeType: item.type,
        coordinates: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      }))

      setResults(addressResults)
      setIsOpen(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '주소 검색 중 오류가 발생했습니다'
      )
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 디바운스된 검색
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)

    // 기존 타이머 취소
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // 300ms 후 검색 실행
    debounceRef.current = setTimeout(() => {
      searchAddress(value)
    }, 300)
  }

  // 결과 선택
  const handleSelect = (result: AddressResult) => {
    setQuery(result.address)
    setIsOpen(false)
    onSelect(result.address, result.coordinates)
  }

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    searchAddress(query)
  }

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchClick()
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="주소 또는 장소명 검색 (예: Tokyo Dome, 서울역)"
            className="text-text-primary w-full rounded-lg border border-border px-4 py-3 pr-10 placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="h-5 w-5 animate-spin text-muted"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearchClick}
          disabled={isLoading}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
        >
          검색
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}

      {/* 검색 결과 드롭다운 */}
      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-auto rounded-lg border border-border bg-white shadow-lg">
          {results.map((result, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(result)}
              className="w-full px-4 py-3 text-left transition-colors hover:bg-primary-50"
            >
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div>
                  <p className="text-text-primary text-sm font-medium">
                    {result.address}
                  </p>
                  {result.placeType && (
                    <p className="text-xs text-muted">{result.placeType}</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-lg border border-border bg-white p-4 text-center shadow-lg">
          <p className="text-sm text-muted">검색 결과가 없습니다</p>
        </div>
      )}

      <p className="mt-1 text-xs text-muted">
        전세계 주소 및 장소명 검색 가능 (Powered by OpenStreetMap)
      </p>
    </div>
  )
}
