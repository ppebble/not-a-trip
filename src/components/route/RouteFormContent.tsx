'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import {
  SpotOrderList,
  type SpotOrderItem,
} from '@/components/route/SpotOrderList'
import { calculateRouteDistances } from '@/lib/route-utils'
import type { Route, RouteDifficulty } from '@/types/route'
import { OptimizedImage } from '@/components/common/OptimizedImage'

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary" />
    </div>
  ),
})

interface RouteFormContentProps {
  /** 수정 모드 시 기존 코스 데이터 */
  initialRoute?: Route
  /** 수정 모드 여부 */
  isEditMode?: boolean
}

const DIFFICULTY_OPTIONS: { value: RouteDifficulty; label: string }[] = [
  { value: 'easy', label: '🟢 쉬움' },
  { value: 'moderate', label: '🟡 보통' },
  { value: 'hard', label: '🔴 어려움' },
]

/** 사전 정의된 지역 태그 목록 */
const REGION_TAG_OPTIONS = [
  '도쿄',
  '가마쿠라/에노시마',
  '교토',
  '오사카',
  '나고야',
  '삿포로',
  '후쿠오카',
  '오키나와',
  '기타',
]

/** 주소 키워드 → 지역 태그 매핑 (일본어/한국어 주소 대응) */
const REGION_ADDRESS_MAP: { keywords: string[]; tag: string }[] = [
  { keywords: ['東京', '도쿄', 'Tokyo'], tag: '도쿄' },
  {
    keywords: [
      '鎌倉',
      '가마쿠라',
      '江ノ島',
      '에노시마',
      '藤沢',
      'Kamakura',
      'Enoshima',
    ],
    tag: '가마쿠라/에노시마',
  },
  { keywords: ['京都', '교토', 'Kyoto'], tag: '교토' },
  { keywords: ['大阪', '오사카', 'Osaka'], tag: '오사카' },
  { keywords: ['名古屋', '나고야', '愛知', 'Nagoya'], tag: '나고야' },
  {
    keywords: ['札幌', '삿포로', '北海道', 'Sapporo', 'Hokkaido'],
    tag: '삿포로',
  },
  { keywords: ['福岡', '후쿠오카', 'Fukuoka'], tag: '후쿠오카' },
  { keywords: ['沖縄', '오키나와', 'Okinawa'], tag: '오키나와' },
]

/** 주소 문자열에서 지역 태그 추출 */
function extractRegionFromAddress(address: string): string | null {
  for (const { keywords, tag } of REGION_ADDRESS_MAP) {
    if (keywords.some((kw) => address.includes(kw))) return tag
  }
  return null
}

/** SpotOrderItem 배열에 거리/시간 재계산 적용 */
function recalcDistances(spots: SpotOrderItem[]): SpotOrderItem[] {
  if (spots.length === 0) return spots
  const distances = calculateRouteDistances(spots)
  return spots.map((spot, i) => ({
    ...spot,
    distanceFromPrev: distances[i].distanceFromPrev,
    walkTimeFromPrev: distances[i].walkTimeFromPrev,
  }))
}

/**
 * RouteFormContent - 코스 생성/수정 공통 폼
 * Requirements: 1.1, 1.2, 1.3, 1.5
 */
export function RouteFormContent({
  initialRoute,
  isEditMode = false,
}: RouteFormContentProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // 폼 상태
  const [name, setName] = useState(initialRoute?.name || '')
  const [description, setDescription] = useState(
    initialRoute?.description || ''
  )
  const [estimatedDuration, setEstimatedDuration] = useState(
    initialRoute?.estimatedDuration?.toString() || ''
  )
  const [difficulty, setDifficulty] = useState<RouteDifficulty>(
    initialRoute?.difficulty || 'moderate'
  )
  const [isPublic, setIsPublic] = useState(initialRoute?.isPublic !== false)
  const [relatedContentNames, setRelatedContentNames] = useState<string[]>(
    initialRoute?.relatedContentNames || []
  )
  const [regionTags, setRegionTags] = useState<string[]>(
    initialRoute?.regionTags || []
  )
  const [contentInput, setContentInput] = useState('')
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([])
  const [hasContentSearched, setHasContentSearched] = useState(false)
  const contentDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // 시작 지점
  const [startPointName, setStartPointName] = useState(
    initialRoute?.startPoint?.name || ''
  )
  const [startPointAddress, setStartPointAddress] = useState(
    initialRoute?.startPoint?.address || ''
  )
  const [startPointCoords, setStartPointCoords] = useState<{
    lat: number
    lng: number
  } | null>(initialRoute?.startPoint?.coordinates || null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocodeError, setGeocodeError] = useState('')
  const [geocodeResults, setGeocodeResults] = useState<GeocodeSuggestion[]>([])
  const [hasGeoSearched, setHasGeoSearched] = useState(false)

  // 스팟 목록
  const [spots, setSpots] = useState<SpotOrderItem[]>(() => {
    if (initialRoute?.spots) {
      return initialRoute.spots.map((s) => ({
        spotId: s.spotId,
        spotName: s.spotName,
        coordinates: s.coordinates,
        thumbnailUrl: s.thumbnailUrl,
        note: s.note,
        distanceFromPrev: s.distanceFromPrev,
        walkTimeFromPrev: s.walkTimeFromPrev,
      }))
    }
    return []
  })

  // 스팟 검색
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // 제출 상태
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [showPreview, setShowPreview] = useState(false)

  // 미인증 시 리다이렉트
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [isAuthenticated, router])

  /** 스팟 검색 */
  const searchSpots = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }
    try {
      const res = await fetch(`/api/spots?search=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResults(
        data.spots.map(
          (s: {
            id: string
            name: string
            thumbnailUrl: string
            coordinates: number[]
          }) => ({
            id: s.id,
            name: s.name,
            thumbnailUrl: s.thumbnailUrl,
            coordinates: s.coordinates,
          })
        )
      )
    } catch {
      setSearchResults([])
    } finally {
      setHasSearched(true)
    }
  }, [])

  /** 디바운스 검색 */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setSearchQuery(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => searchSpots(value), 300)
    },
    [searchSpots]
  )

  /** 스팟 추가 */
  const handleAddSpot = useCallback(
    async (spotId: string) => {
      // 중복 체크
      if (spots.some((s) => s.spotId === spotId)) return

      try {
        const res = await fetch(`/api/spots/${spotId}`)
        if (!res.ok) return
        const spot = await res.json()

        const newSpot: SpotOrderItem = {
          spotId: spot.id,
          spotName: spot.name,
          coordinates: Array.isArray(spot.coordinates)
            ? { lat: spot.coordinates[0], lng: spot.coordinates[1] }
            : spot.coordinates,
          thumbnailUrl: spot.photos?.[0] || '',
          note: undefined,
          distanceFromPrev: null,
          walkTimeFromPrev: null,
        }

        const newSpots = recalcDistances([...spots, newSpot])
        setSpots(newSpots)
        setSearchQuery('')
        setSearchResults([])
        setHasSearched(false)

        // 스팟의 relatedContent에서 작품명 자동 추출
        if (spot.relatedContent && Array.isArray(spot.relatedContent)) {
          const newNames = spot.relatedContent
            .map((rc: { name: string }) => rc.name)
            .filter(
              (name: string) => name && !relatedContentNames.includes(name)
            )
          if (newNames.length > 0) {
            setRelatedContentNames((prev) => [
              ...new Set([...prev, ...newNames]),
            ])
          }
        }

        // 스팟 주소에서 지역 태그 자동 추출
        const address = spot.address || ''
        if (address) {
          const extracted = extractRegionFromAddress(address)
          if (extracted) {
            setRegionTags((prev) =>
              prev.includes(extracted) ? prev : [...prev, extracted]
            )
          }
        }
      } catch {
        // 에러 무시
      }
    },
    [spots, relatedContentNames]
  )

  /** 스팟 순서 변경 시 거리 재계산 */
  const handleSpotsChange = useCallback((newSpots: SpotOrderItem[]) => {
    setSpots(recalcDistances(newSpots))
  }, [])

  /** 작품명 자동완성 검색 */
  const searchContent = useCallback(async (query: string) => {
    if (!query.trim()) {
      setContentSuggestions([])
      setHasContentSearched(false)
      return
    }
    try {
      const res = await fetch(
        `/api/content-names?type=content&search=${encodeURIComponent(query)}`
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setContentSuggestions(
        data.items.map((item: { name: string }) => item.name)
      )
    } catch {
      setContentSuggestions([])
    } finally {
      setHasContentSearched(true)
    }
  }, [])

  /** 작품명 입력 디바운스 핸들러 */
  const handleContentInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setContentInput(value)
      if (contentDebounceRef.current) clearTimeout(contentDebounceRef.current)
      contentDebounceRef.current = setTimeout(() => searchContent(value), 300)
    },
    [searchContent]
  )

  /** Nominatim 주소 검색 (복수 결과) */
  const handleGeocode = useCallback(async () => {
    if (!startPointAddress.trim()) return
    setIsGeocoding(true)
    setGeocodeError('')
    setGeocodeResults([])
    setHasGeoSearched(false)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startPointAddress)}&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'ja,ko,en' } }
      )
      const data = await res.json()
      if (data.length > 0) {
        setGeocodeResults(
          data.map(
            (item: {
              lat: string
              lon: string
              display_name: string
              type: string
              class: string
            }) => ({
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
              displayName: item.display_name,
              type: item.type,
              placeClass: item.class,
            })
          )
        )
      } else {
        setGeocodeError('검색 결과가 없습니다')
      }
    } catch {
      setGeocodeError('주소 검색에 실패했습니다')
    } finally {
      setIsGeocoding(false)
      setHasGeoSearched(true)
    }
  }, [startPointAddress])

  /** 검색 결과에서 장소 선택 */
  const handleSelectGeoResult = useCallback(
    (result: GeocodeSuggestion) => {
      setStartPointCoords({ lat: result.lat, lng: result.lng })
      setStartPointAddress(result.displayName)
      if (!startPointName.trim()) {
        // 장소명이 비어있으면 display_name의 첫 부분을 자동 채움
        const shortName = result.displayName.split(',')[0].trim()
        setStartPointName(shortName)
      }
      setGeocodeResults([])
      setHasGeoSearched(false)
    },
    [startPointName]
  )

  /** 자동완성에서 작품명 선택 */
  const handleSelectContent = useCallback(
    (name: string) => {
      if (!relatedContentNames.includes(name)) {
        setRelatedContentNames((prev) => [...prev, name])
      }
      setContentInput('')
      setContentSuggestions([])
      setHasContentSearched(false)
    },
    [relatedContentNames]
  )

  /** 작품명 삭제 */
  const handleRemoveContent = useCallback((index: number) => {
    setRelatedContentNames((prev) => prev.filter((_, i) => i !== index))
  }, [])

  /** 폼 유효성 검사 */
  const validate = useCallback((): string[] => {
    const errs: string[] = []
    if (!name.trim()) errs.push('코스명은 필수입니다')
    if (!description.trim()) errs.push('설명은 필수입니다')
    if (!estimatedDuration || parseInt(estimatedDuration, 10) <= 0)
      errs.push('예상 소요시간은 필수입니다')
    if (spots.length < 2) errs.push('코스에는 최소 2개의 스팟이 필요합니다')
    return errs
  }, [name, description, estimatedDuration, spots])

  /** 제출 */
  const handleSubmit = useCallback(async () => {
    const validationErrors = validate()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])
    setIsSubmitting(true)

    const startPoint =
      startPointName.trim() && startPointAddress.trim() && startPointCoords
        ? {
            name: startPointName.trim(),
            address: startPointAddress.trim(),
            coordinates: startPointCoords,
          }
        : undefined

    const body = {
      name: name.trim(),
      description: description.trim(),
      estimatedDuration: parseInt(estimatedDuration, 10),
      difficulty,
      startPoint,
      spots: spots.map((s) => ({ spotId: s.spotId, note: s.note })),
      relatedContentNames,
      regionTags: regionTags.length > 0 ? regionTags : undefined,
      isPublic,
    }

    try {
      const url = isEditMode ? `/api/routes/${initialRoute!.id}` : '/api/routes'
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setErrors([data.error || '저장에 실패했습니다'])
        return
      }

      const data = await res.json()
      router.push(`/routes/${isEditMode ? initialRoute!.id : data.id}`)
    } catch {
      setErrors(['네트워크 오류가 발생했습니다'])
    } finally {
      setIsSubmitting(false)
    }
  }, [
    validate,
    name,
    description,
    estimatedDuration,
    difficulty,
    spots,
    relatedContentNames,
    regionTags,
    isPublic,
    isEditMode,
    initialRoute,
    router,
  ])

  // 미리보기용 RouteSpot 변환
  const previewSpots = spots.map((s) => ({
    ...s,
    isAvailable: true,
  }))

  return (
    <div className="space-y-6">
      {/* 에러 표시 */}
      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Step 1: 기본 정보 (코스명 + 설명만) */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
        <h2 className="text-text-primary mb-4 text-lg font-semibold">
          기본 정보
        </h2>
        <div className="space-y-4">
          {/* 코스명 */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              코스명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 도쿄 반일 봇치 더 록 코스"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              maxLength={100}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="코스에 대한 설명을 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Step 2: 스팟 관리 (핵심) */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
        <h2 className="text-text-primary mb-4 text-lg font-semibold">
          스팟 목록 <span className="text-red-500">*</span>
          <span className="ml-2 text-sm font-normal text-muted">
            ({spots.length}개)
          </span>
        </h2>

        {/* 스팟 검색 */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="스팟 이름 또는 작품명으로 검색하여 추가"
            className="w-full rounded-lg border border-border px-3 py-2 pl-9 text-sm focus:border-primary focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-muted">🔍</span>

          {/* 검색 결과 드롭다운 */}
          {searchQuery && hasSearched && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
              {searchResults.length === 0 ? (
                <div className="px-4 py-4 text-center text-sm text-muted">
                  &ldquo;{searchQuery}&rdquo;에 대한 검색 결과가 없습니다
                </div>
              ) : (
                searchResults.map((result) => {
                  const alreadyAdded = spots.some((s) => s.spotId === result.id)
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleAddSpot(result.id)}
                      disabled={alreadyAdded}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-primary-50 disabled:opacity-40 dark:hover:bg-neutral-700"
                    >
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-surface">
                        {result.thumbnailUrl ? (
                          <OptimizedImage
                            src={result.thumbnailUrl}
                            alt={result.name}
                            width={32}
                            height={32}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-muted">
                            📍
                          </div>
                        )}
                      </div>
                      <span className="text-text-primary truncate text-sm">
                        {result.name}
                      </span>
                      {alreadyAdded && (
                        <span className="ml-auto text-xs text-muted">
                          추가됨
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>

        {/* 스팟 순서 목록 */}
        <SpotOrderList
          spots={spots}
          onSpotsChange={handleSpotsChange}
          startPoint={
            startPointName && startPointCoords
              ? {
                  name: startPointName,
                  address: startPointAddress,
                  coordinates: startPointCoords,
                }
              : undefined
          }
        />
      </section>

      {/* Step 3: 시작 지점 (선택) */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-800">
        <h2 className="text-text-primary mb-1 text-lg font-semibold">
          시작 지점
          <span className="ml-2 text-sm font-normal text-muted">(선택)</span>
        </h2>
        <p className="mb-4 text-xs text-muted">
          숙소, 역 등 출발 지점을 등록하면 첫 스팟까지의 거리/이동 정보가
          표시됩니다.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              출발지 별명
            </label>
            <input
              type="text"
              value={startPointName}
              onChange={(e) => setStartPointName(e.target.value)}
              placeholder="예: 우리 숙소, 신주쿠역 앞, 출발점"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
              maxLength={100}
            />
          </div>
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              주소
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={startPointAddress}
                onChange={(e) => {
                  setStartPointAddress(e.target.value)
                  setGeocodeError('')
                  setGeocodeResults([])
                  setHasGeoSearched(false)
                  setStartPointCoords(null)
                }}
                placeholder="예: 東京都新宿区新宿3丁目"
                className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleGeocode()
                  }
                }}
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding || !startPointAddress.trim()}
                className="flex-shrink-0 rounded-lg bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-700 disabled:bg-neutral-300"
              >
                {isGeocoding ? '검색 중...' : '🔍 주소 검색'}
              </button>
            </div>
            {geocodeError && (
              <p className="mt-1 text-xs text-red-500">{geocodeError}</p>
            )}
            {!startPointCoords && (
              <p className="mt-1.5 text-xs text-primary">
                💡 검색이 잘 안 되나요? &apos;역&apos;, &apos;호텔&apos;을 빼고
                핵심 키워드(예: 신주쿠)만 검색해 보세요.
              </p>
            )}
            {hasGeoSearched &&
              geocodeResults.length > 0 &&
              !startPointCoords && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {geocodeResults.map((result, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectGeoResult(result)}
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-primary-50 dark:hover:bg-neutral-700"
                    >
                      <OptimizedImage
                        src={getPlaceIconPath(result.type, result.placeClass)}
                        alt={result.type}
                        width={20}
                        height={20}
                        className="flex-shrink-0"
                        disableBlur
                      />
                      <span className="text-text-primary truncate text-sm">
                        {result.displayName}
                      </span>
                    </button>
                  ))}
                </div>
              )}
          </div>
          {startPointCoords && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
              <span className="text-sm text-green-700">
                ✅ 좌표 확인: {startPointCoords.lat.toFixed(5)},{' '}
                {startPointCoords.lng.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setStartPointName('')
                  setStartPointAddress('')
                  setStartPointCoords(null)
                  setGeocodeError('')
                }}
                className="ml-auto text-xs text-red-400 hover:text-red-600"
              >
                초기화
              </button>
            </div>
          )}
          {startPointCoords && (
            <div className="overflow-hidden rounded-lg border border-border">
              <iframe
                title="선택된 출발지 위치"
                width="100%"
                height="200"
                style={{ border: 0, pointerEvents: 'none' }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${startPointCoords.lng - 0.005},${startPointCoords.lat - 0.003},${startPointCoords.lng + 0.005},${startPointCoords.lat + 0.003}&layer=mapnik&marker=${startPointCoords.lat},${startPointCoords.lng}`}
              />
            </div>
          )}
        </div>
      </section>

      {/* Step 4: 코스 디테일 (태그 + 소요시간 + 난이도 + 공개설정) */}
      <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-900">
        <h2 className="text-text-primary mb-4 text-lg font-semibold">
          코스 디테일
        </h2>
        <div className="space-y-4">
          {/* 관련 작품 (자동완성) */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              관련 작품
            </label>
            <p className="mb-2 text-xs text-muted">
              스팟 추가 시 작품명이 자동 추출됩니다. 검색하여 추가할 수도
              있습니다.
            </p>
            <div className="relative">
              <input
                type="text"
                value={contentInput}
                onChange={handleContentInputChange}
                placeholder="작품명 검색"
                className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
              {contentInput &&
                hasContentSearched &&
                contentSuggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                    {contentSuggestions.map((suggestion) => {
                      const alreadyAdded =
                        relatedContentNames.includes(suggestion)
                      return (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleSelectContent(suggestion)}
                          disabled={alreadyAdded}
                          className="text-text-primary flex w-full items-center px-4 py-2 text-left text-sm transition-colors hover:bg-primary-50 disabled:opacity-40 dark:hover:bg-neutral-700"
                        >
                          <span className="truncate">{suggestion}</span>
                          {alreadyAdded && (
                            <span className="ml-auto text-xs text-muted">
                              추가됨
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
            </div>
            {relatedContentNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedContentNames.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-0.5 text-xs text-primary"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveContent(i)}
                      className="text-muted hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 지역 태그 (복수 선택 토글) */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              지역 태그
            </label>
            <p className="mb-2 text-xs text-muted">
              스팟 추가 시 주소에서 자동 추출됩니다. 직접 선택할 수도 있습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              {REGION_TAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setRegionTags((prev) =>
                      prev.includes(tag)
                        ? prev.filter((t) => t !== tag)
                        : [...prev, tag]
                    )
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    regionTags.includes(tag)
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-white text-primary hover:border-neutral-300 hover:bg-primary-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 예상 소요시간 + 이동시간 힌트 */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              예상 소요시간 (분) <span className="text-red-500">*</span>
            </label>
            {spots.length >= 2 &&
              (() => {
                const totalWalkTime = spots.reduce(
                  (sum, s) => sum + (s.walkTimeFromPrev || 0),
                  0
                )
                return totalWalkTime > 0 ? (
                  <p className="mb-1.5 text-xs text-primary">
                    💡 스팟 간 이동시간 합계: 약 {totalWalkTime}분 (도보 기준).
                    관람 시간을 더해 입력해 주세요.
                  </p>
                ) : null
              })()}
            <input
              type="number"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
              placeholder="120"
              min={1}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          {/* 난이도 */}
          <div>
            <label className="text-text-secondary mb-1 block text-sm font-medium">
              난이도 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDifficulty(opt.value)}
                  className={`flex-1 rounded-lg border px-2 py-2 text-sm transition-colors ${
                    difficulty === opt.value
                      ? 'text-text-secondary border-primary bg-primary-50 font-medium'
                      : 'border-border text-muted hover:border-neutral-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 공개/비공개 */}
          <div className="flex items-center gap-3">
            <label className="text-text-secondary text-sm font-medium">
              공개 설정
            </label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isPublic ? 'bg-primary' : 'bg-neutral-200'
              }`}
              role="switch"
              aria-checked={isPublic}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  isPublic ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
            <span className="text-sm text-muted">
              {isPublic ? '공개' : '비공개'}
            </span>
          </div>
        </div>
      </section>

      {/* 미리보기 */}
      {showPreview && spots.length >= 2 && (
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-neutral-900">
          <h2 className="text-text-primary mb-3 text-lg font-semibold">
            코스 미리보기
          </h2>
          <RouteMap
            spots={previewSpots}
            startPoint={
              startPointName && startPointCoords
                ? {
                    name: startPointName,
                    address: startPointAddress,
                    coordinates: startPointCoords,
                  }
                : undefined
            }
          />
        </section>
      )}

      {/* 하단 액션 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-border bg-white px-6 py-3 text-sm text-primary transition-colors hover:bg-primary-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-primary-400 dark:hover:bg-neutral-800"
        >
          취소
        </button>
        {spots.length >= 2 && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-border bg-white px-6 py-3 text-sm text-primary transition-colors hover:bg-primary-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-primary-400 dark:hover:bg-neutral-800"
          >
            {showPreview ? '미리보기 닫기' : '🗺️ 미리보기'}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:bg-neutral-300"
        >
          {isSubmitting ? '저장 중...' : isEditMode ? '코스 수정' : '코스 생성'}
        </button>
      </div>
    </div>
  )
}

/** 스팟 검색 결과 타입 */
interface SpotSearchResult {
  id: string
  name: string
  thumbnailUrl: string
  coordinates: number[]
}

/** Nominatim 검색 결과 타입 */
interface GeocodeSuggestion {
  lat: number
  lng: number
  displayName: string
  type: string // e.g., "station", "stop", "administrative"
  placeClass: string // e.g., "railway", "highway", "place"
}

/** Nominatim type/class → 아이콘 경로 매핑 */
function getPlaceIconPath(type: string, placeClass: string): string {
  if (placeClass === 'railway' && type === 'station')
    return '/icons/start-point/station.webp'
  if (placeClass === 'railway' && (type === 'stop' || type === 'halt'))
    return '/icons/start-point/stop.webp'
  if (
    placeClass === 'highway' &&
    (type === 'bus_stop' || type === 'bus_station')
  )
    return '/icons/start-point/bus.webp'
  if (placeClass === 'tourism' || placeClass === 'amenity')
    return '/icons/start-point/building.webp'
  return '/icons/start-point/default.webp'
}
