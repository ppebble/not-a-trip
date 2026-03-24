'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useGooglePlacesLoader } from '@/hooks/useGooglePlacesLoader'

const DEBOUNCE_MS = 500

interface PlaceResult {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  googlePlaceId: string
}

interface Suggestion {
  placePrediction: google.maps.places.PlacePrediction
}

interface GooglePlacesSearchProps {
  onSelect: (place: PlaceResult) => void
  /** 검색 바이어스 중심 좌표 */
  biasCenter?: { lat: number; lng: number }
}

/**
 * 구글 Places Autocomplete 검색 컴포넌트 (New API - 비용 최적화)
 *
 * - AutocompleteSuggestion API (2025년 3월~ 신규 고객 필수)
 * - Session Token: 타이핑~선택까지 1회 과금으로 묶음
 * - Debouncing: 500ms 디바운스로 불필요한 API 호출 방지
 * - Field Masking: displayName, formattedAddress, location만 요청
 */
export default function GooglePlacesSearch({
  onSelect,
  biasCenter,
}: GooglePlacesSearchProps) {
  const { isLoaded, loadError, loadScript } = useGooglePlacesLoader()

  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const requestIdRef = useRef(0)

  // 세션 토큰 초기화
  useEffect(() => {
    if (!isLoaded) return
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }, [isLoaded])

  // 새 세션 토큰 발급
  const refreshSessionToken = useCallback(() => {
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }, [])

  // 디바운스된 자동완성 검색 (New API: AutocompleteSuggestion)
  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!sessionTokenRef.current || !input.trim()) {
        setSuggestions([])
        return
      }

      const currentRequestId = ++requestIdRef.current
      setIsSearching(true)

      try {
        const request: google.maps.places.AutocompleteRequest = {
          input,
          sessionToken: sessionTokenRef.current,
          language: 'ja',
        }

        // 바이어스 중심이 있으면 위치 기반 검색
        if (biasCenter) {
          request.locationBias = new google.maps.Circle({
            center: new google.maps.LatLng(biasCenter.lat, biasCenter.lng),
            radius: 5000,
          })
        }

        const { suggestions: results } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            request
          )

        // 레이스 컨디션 방지: 최신 요청만 반영
        if (currentRequestId !== requestIdRef.current) return

        setSuggestions(
          results.filter(
            (s): s is Suggestion => s.placePrediction !== undefined
          )
        )
      } catch {
        if (currentRequestId === requestIdRef.current) {
          setSuggestions([])
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false)
        }
      }
    },
    [biasCenter]
  )

  // 입력 변경 핸들러 (디바운스 적용)
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      if (!value.trim()) {
        setSuggestions([])
        return
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value)
      }, DEBOUNCE_MS)
    },
    [fetchSuggestions]
  )

  // 장소 선택 → toPlace() + fetchFields() (New API)
  const handleSelectSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      try {
        const place = suggestion.placePrediction.toPlace()

        // ⭐ 필드 마스킹: 필요한 필드만 요청 (비용 절감)
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'id'],
        })

        const location = place.location
        if (!location) return

        const result: PlaceResult = {
          name: place.displayName ?? '',
          address: place.formattedAddress ?? '',
          coordinates: { lat: location.lat(), lng: location.lng() },
          googlePlaceId: place.id ?? '',
        }

        setSelectedPlace(result)
        setSuggestions([])
        setQuery('')
        onSelect(result)

        // 선택 완료 → 새 세션 토큰 발급 (다음 검색용)
        refreshSessionToken()
      } catch {
        // 장소 상세 조회 실패 시 무시
      }
    },
    [onSelect, refreshSessionToken]
  )

  // 선택 해제
  const handleClear = useCallback(() => {
    setSelectedPlace(null)
    setQuery('')
    setSuggestions([])
    refreshSessionToken()
    inputRef.current?.focus()
  }, [refreshSessionToken])

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  if (loadError) {
    return (
      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
        ⚠️ 구글맵 로드에 실패했습니다. API 키를 확인해주세요.
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="relative">
        <input
          type="text"
          onFocus={loadScript}
          placeholder="장소 이름으로 검색 (포커스 시 구글맵 로드)"
          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 transition-colors focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
          readOnly
        />
      </div>
    )
  }

  // 선택 완료 상태
  if (selectedPlace) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-green-800">
              📍 {selectedPlace.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-green-600">
              {selectedPlace.address}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="ml-2 flex-shrink-0 rounded-md p-1 text-green-500 transition-colors hover:bg-green-100 hover:text-green-700"
            aria-label="장소 다시 검색"
          >
            <svg
              className="h-4 w-4"
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
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="장소 이름으로 검색 (예: 아키하바라 건담 카페)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-400"
      />

      {/* 로딩 인디케이터 */}
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            className="h-4 w-4 animate-spin text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      )}

      {/* 자동완성 드롭다운 */}
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            return (
              <li key={prediction.placeId ?? index}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-primary-50"
                >
                  <span className="mt-0.5 flex-shrink-0 text-gray-400">📍</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {prediction.mainText?.toString() ?? ''}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {prediction.secondaryText?.toString() ?? ''}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
