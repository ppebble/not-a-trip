'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useLoadScript } from '@react-google-maps/api'

const LIBRARIES: 'places'[] = ['places']
const DEBOUNCE_MS = 500

interface PlaceResult {
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  googlePlaceId: string
}

interface GooglePlacesSearchProps {
  onSelect: (place: PlaceResult) => void
  /** 검색 바이어스 중심 좌표 */
  biasCenter?: { lat: number; lng: number }
}

/**
 * 구글 Places Autocomplete 검색 컴포넌트 (비용 최적화)
 *
 * - Session Token: 타이핑~선택까지 1회 과금으로 묶음
 * - Debouncing: 500ms 디바운스로 불필요한 API 호출 방지
 * - Field Masking: name, geometry, formatted_address, place_id만 요청
 */
export default function GooglePlacesSearch({
  onSelect,
  biasCenter,
}: GooglePlacesSearchProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
    language: 'ja',
    region: 'JP',
  })

  const [query, setQuery] = useState('')
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const inputRef = useRef<HTMLInputElement | null>(null)
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  )
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dummyDivRef = useRef<HTMLDivElement | null>(null)

  // 서비스 초기화
  useEffect(() => {
    if (!isLoaded) return
    autocompleteRef.current = new google.maps.places.AutocompleteService()
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()

    // PlacesService는 DOM 요소가 필요
    if (!dummyDivRef.current) {
      dummyDivRef.current = document.createElement('div')
    }
    placesServiceRef.current = new google.maps.places.PlacesService(
      dummyDivRef.current
    )
  }, [isLoaded])

  // 새 세션 토큰 발급
  const refreshSessionToken = useCallback(() => {
    sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken()
  }, [])

  // 디바운스된 자동완성 검색
  const fetchPredictions = useCallback(
    (input: string) => {
      if (
        !autocompleteRef.current ||
        !sessionTokenRef.current ||
        !input.trim()
      ) {
        setPredictions([])
        return
      }

      setIsSearching(true)

      const request: google.maps.places.AutocompletionRequest = {
        input,
        sessionToken: sessionTokenRef.current,
        language: 'ja',
      }

      // 바이어스 중심이 있으면 위치 기반 검색
      if (biasCenter) {
        request.location = new google.maps.LatLng(
          biasCenter.lat,
          biasCenter.lng
        )
        request.radius = 5000
      }

      autocompleteRef.current.getPlacePredictions(
        request,
        (results, status) => {
          setIsSearching(false)
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results)
          } else {
            setPredictions([])
          }
        }
      )
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
        setPredictions([])
        return
      }

      debounceTimerRef.current = setTimeout(() => {
        fetchPredictions(value)
      }, DEBOUNCE_MS)
    },
    [fetchPredictions]
  )

  // 장소 선택 → getDetails로 상세 정보 가져오기 (필드 마스킹)
  const handleSelectPrediction = useCallback(
    (prediction: google.maps.places.AutocompletePrediction) => {
      if (!placesServiceRef.current || !sessionTokenRef.current) return

      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          // ⭐ 필드 마스킹: 필요한 4개 필드만 요청 (비용 절감)
          fields: ['name', 'geometry', 'formatted_address', 'place_id'],
          sessionToken: sessionTokenRef.current,
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place)
            return

          const location = place.geometry?.location
          if (!location) return

          const result: PlaceResult = {
            name: place.name ?? '',
            address: place.formatted_address ?? '',
            coordinates: { lat: location.lat(), lng: location.lng() },
            googlePlaceId: place.place_id ?? '',
          }

          setSelectedPlace(result)
          setPredictions([])
          setQuery('')
          onSelect(result)

          // 선택 완료 → 새 세션 토큰 발급 (다음 검색용)
          refreshSessionToken()
        }
      )
    },
    [onSelect, refreshSessionToken]
  )

  // 선택 해제
  const handleClear = useCallback(() => {
    setSelectedPlace(null)
    setQuery('')
    setPredictions([])
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
      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400">
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
        구글맵 로딩 중...
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
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
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
      {predictions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {predictions.map((prediction) => (
            <li key={prediction.place_id}>
              <button
                type="button"
                onClick={() => handleSelectPrediction(prediction)}
                className="flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors hover:bg-navy-50"
              >
                <span className="mt-0.5 flex-shrink-0 text-gray-400">📍</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {prediction.structured_formatting.main_text}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {prediction.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
