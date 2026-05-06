'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Spot, SpotPin, CATEGORY_CONFIG } from '@/types'

export interface SpotSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectSpot: (spot: Spot) => void
}

interface SpotSearchResult {
  id: string
  name: string
  thumbnailUrl: string
  category?: string
  contentName?: string
}

/**
 * 스팟 검색 모달 컴포넌트
 * Requirements: 4.2, 4.3
 * - 4.2: "어떤 스팟을 다녀오셨나요?" 프롬프트 표시
 * - 4.3: 스팟 이름/콘텐츠 제목 검색 기능
 */
export function SpotSearchModal({
  isOpen,
  onClose,
  onSelectSpot,
}: SpotSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 모달 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // 모달 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setError(null)
      setSelectedSpotId(null)
    }
  }, [isOpen])

  // 스팟 검색 API 호출
  const searchSpots = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/spots?search=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('검색 실패')

      const data = await res.json()
      const results: SpotSearchResult[] = data.spots.map((spot: SpotPin) => ({
        id: spot.id,
        name: spot.name,
        thumbnailUrl: spot.thumbnailUrl,
        category: spot.category,
        contentName: spot.contentName,
      }))

      setSearchResults(results)
    } catch {
      setError('스팟 검색에 실패했습니다')
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 디바운스된 검색
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      debounceRef.current = setTimeout(() => {
        searchSpots(value)
      }, 300)
    },
    [searchSpots]
  )

  // 스팟 선택 핸들러
  const handleSelectSpot = useCallback(
    async (spotId: string) => {
      setSelectedSpotId(spotId)
      setIsLoading(true)

      try {
        // 스팟 상세 정보 조회
        const res = await fetch(`/api/spots/${spotId}`)
        if (!res.ok) throw new Error('스팟 정보 조회 실패')

        const spot: Spot = await res.json()
        onSelectSpot(spot)
      } catch {
        setError('스팟 정보를 불러오는데 실패했습니다')
        setSelectedSpotId(null)
      } finally {
        setIsLoading(false)
      }
    },
    [onSelectSpot]
  )

  // 검색어 초기화
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    setSearchResults([])
    inputRef.current?.focus()
  }, [])

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spot-search-title"
    >
      <div
        className="max-h-[80vh] w-full max-w-md overflow-hidden rounded-xl bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="spot-search-title" className="text-lg font-bold">
            어떤 스팟을 다녀오셨나요?
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-neutral-100"
            aria-label="닫기"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
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

        {/* 검색 입력 */}
        <div className="p-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="스팟 이름 또는 작품명으로 검색"
              className="w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-label="스팟 검색"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-600"
                aria-label="검색어 초기화"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="max-h-[50vh] overflow-y-auto border-t">
          {isLoading && !selectedSpotId && (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-sm text-red-600">{error}</div>
          )}

          {!isLoading &&
            !error &&
            searchQuery &&
            searchResults.length === 0 && (
              <div className="p-8 text-center text-neutral-500">
                <p className="mb-2">검색 결과가 없습니다</p>
                <p className="text-sm">다른 검색어로 시도해보세요</p>
              </div>
            )}

          {!isLoading && !error && !searchQuery && (
            <div className="p-8 text-center text-neutral-500">
              <p className="mb-2">스팟을 검색해주세요</p>
              <p className="text-sm">
                스팟 이름이나 작품명으로 검색할 수 있어요
              </p>
            </div>
          )}

          {searchResults.length > 0 && (
            <ul className="divide-y">
              {searchResults.map((spot) => (
                <li key={spot.id}>
                  <button
                    onClick={() => handleSelectSpot(spot.id)}
                    disabled={isLoading && selectedSpotId === spot.id}
                    className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {/* 썸네일 */}
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                      {spot.thumbnailUrl ? (
                        <Image
                          src={spot.thumbnailUrl}
                          alt={spot.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-400">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                        </div>
                      )}
                    </div>

                    {/* 스팟 정보 */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-neutral-900">
                        {spot.name}
                      </p>
                      {spot.contentName && (
                        <p className="truncate text-sm text-primary">
                          {spot.contentName}
                        </p>
                      )}
                      {spot.category &&
                        CATEGORY_CONFIG[
                          spot.category as keyof typeof CATEGORY_CONFIG
                        ] && (
                          <p className="text-xs text-neutral-500">
                            {
                              CATEGORY_CONFIG[
                                spot.category as keyof typeof CATEGORY_CONFIG
                              ].label
                            }
                          </p>
                        )}
                    </div>

                    {/* 로딩 또는 화살표 */}
                    {isLoading && selectedSpotId === spot.id ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <svg
                        className="h-5 w-5 flex-shrink-0 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
