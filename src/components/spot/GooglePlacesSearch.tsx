'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useLoadScript, StandaloneSearchBox } from '@react-google-maps/api'

const LIBRARIES: 'places'[] = ['places']

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
 * 구글 Places Autocomplete 검색 컴포넌트
 *
 * 유저가 장소 이름을 검색하면 자동완성 드롭다운이 표시되고,
 * 선택 시 이름/주소/좌표/placeId가 콜백으로 전달됩니다.
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

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)

  const onLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref
  }, [])

  // 검색 바이어스 설정
  useEffect(() => {
    if (searchBoxRef.current && biasCenter) {
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(biasCenter.lat - 0.05, biasCenter.lng - 0.05),
        new google.maps.LatLng(biasCenter.lat + 0.05, biasCenter.lng + 0.05)
      )
      searchBoxRef.current.setBounds(bounds)
    }
  }, [biasCenter])

  const onPlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces()
    if (!places || places.length === 0) return

    const place = places[0]
    const location = place.geometry?.location

    if (!location) return

    const result: PlaceResult = {
      name: place.name ?? '',
      address: place.formatted_address ?? '',
      coordinates: { lat: location.lat(), lng: location.lng() },
      googlePlaceId: place.place_id ?? '',
    }

    setSelectedPlace(result)
    onSelect(result)
  }, [onSelect])

  const handleClear = () => {
    setSelectedPlace(null)
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.focus()
    }
  }

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
    <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
      <input
        ref={inputRef}
        type="text"
        placeholder="장소 이름으로 검색 (예: 아키하바라 건담 카페)"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
      />
    </StandaloneSearchBox>
  )
}
