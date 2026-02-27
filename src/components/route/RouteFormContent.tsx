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

const RouteMap = dynamic(() => import('@/components/route/RouteMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-lg bg-navy-100">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-300 border-t-navy-600" />
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
  const [regionTag, setRegionTag] = useState(initialRoute?.regionTag || '')
  const [contentInput, setContentInput] = useState('')

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
  const [isSearching, setIsSearching] = useState(false)
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
      return
    }
    setIsSearching(true)
    try {
      const res = await fetch(
        `/api/spots?search=${encodeURIComponent(query)}`
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSearchResults(
        data.spots.map(
          (s: { id: string; name: string; thumbnailUrl: string; coordinates: number[] }) => ({
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
      setIsSearching(false)
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
          coordinates: spot.coordinates,
          thumbnailUrl: spot.photos?.[0] || '',
          note: undefined,
          distanceFromPrev: null,
          walkTimeFromPrev: null,
        }

        const newSpots = recalcDistances([...spots, newSpot])
        setSpots(newSpots)
        setSearchQuery('')
        setSearchResults([])
      } catch {
        // 에러 무시
      }
    },
    [spots]
  )

  /** 스팟 순서 변경 시 거리 재계산 */
  const handleSpotsChange = useCallback((newSpots: SpotOrderItem[]) => {
    setSpots(recalcDistances(newSpots))
  }, [])

  /** 작품명 추가 */
  const handleAddContent = useCallback(() => {
    const trimmed = contentInput.trim()
    if (!trimmed || relatedContentNames.includes(trimmed)) return
    setRelatedContentNames((prev) => [...prev, trimmed])
    setContentInput('')
  }, [contentInput, relatedContentNames])

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
    if (spots.length < 2)
      errs.push('코스에는 최소 2개의 스팟이 필요합니다')
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

    const body = {
      name: name.trim(),
      description: description.trim(),
      estimatedDuration: parseInt(estimatedDuration, 10),
      difficulty,
      spots: spots.map((s) => ({ spotId: s.spotId, note: s.note })),
      relatedContentNames,
      regionTag: regionTag.trim() || undefined,
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
    validate, name, description, estimatedDuration, difficulty,
    spots, relatedContentNames, regionTag, isPublic,
    isEditMode, initialRoute, router,
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

      {/* 기본 정보 */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">기본 정보</h2>
        <div className="space-y-4">
          {/* 코스명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-700">
              코스명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 도쿄 반일 봇치 더 록 코스"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
              maxLength={100}
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-700">
              설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="코스에 대한 설명을 작성해주세요"
              rows={3}
              className="w-full resize-none rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            />
          </div>

          {/* 예상 소요시간 + 난이도 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
                예상 소요시간 (분) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                placeholder="120"
                min={1}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-navy-700">
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
                        ? 'border-navy-500 bg-navy-50 font-medium text-navy-700'
                        : 'border-navy-200 text-navy-500 hover:border-navy-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 공개/비공개 */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-navy-700">공개 설정</label>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                isPublic ? 'bg-navy-600' : 'bg-navy-200'
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
            <span className="text-sm text-navy-500">
              {isPublic ? '공개' : '비공개'}
            </span>
          </div>
        </div>
      </section>

      {/* 관련 작품 + 지역 태그 */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">태그 정보</h2>
        <div className="space-y-4">
          {/* 관련 작품 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-700">
              관련 작품
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddContent()
                  }
                }}
                placeholder="작품명 입력 후 추가"
                className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddContent}
                disabled={!contentInput.trim()}
                className="rounded-lg bg-navy-100 px-3 text-sm text-navy-600 hover:bg-navy-200 disabled:opacity-40"
              >
                추가
              </button>
            </div>
            {relatedContentNames.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {relatedContentNames.map((c, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full bg-navy-100 px-2.5 py-0.5 text-xs text-navy-600"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() => handleRemoveContent(i)}
                      className="text-navy-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 지역 태그 */}
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-700">
              지역 태그
            </label>
            <input
              type="text"
              value={regionTag}
              onChange={(e) => setRegionTag(e.target.value)}
              placeholder="예: 도쿄, 가마쿠라"
              className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-500 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* 스팟 관리 */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-navy-900">
          스팟 목록 <span className="text-red-500">*</span>
          <span className="ml-2 text-sm font-normal text-navy-400">
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
            className="w-full rounded-lg border border-navy-200 px-3 py-2 pl-9 text-sm focus:border-navy-500 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 text-navy-300">🔍</span>

          {/* 검색 결과 드롭다운 */}
          {(searchResults.length > 0 || isSearching) && searchQuery && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-navy-200 bg-white shadow-lg">
              {isSearching ? (
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-navy-400 border-t-transparent" />
                </div>
              ) : (
                searchResults.map((result) => {
                  const alreadyAdded = spots.some(
                    (s) => s.spotId === result.id
                  )
                  return (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => handleAddSpot(result.id)}
                      disabled={alreadyAdded}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-navy-50 disabled:opacity-40"
                    >
                      <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-navy-100">
                        {result.thumbnailUrl ? (
                          <img
                            src={result.thumbnailUrl}
                            alt={result.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-navy-300">
                            📍
                          </div>
                        )}
                      </div>
                      <span className="truncate text-sm text-navy-800">
                        {result.name}
                      </span>
                      {alreadyAdded && (
                        <span className="ml-auto text-xs text-navy-400">
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
        <SpotOrderList spots={spots} onSpotsChange={handleSpotsChange} />
      </section>

      {/* 미리보기 */}
      {showPreview && spots.length >= 2 && (
        <section className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-navy-900">
            코스 미리보기
          </h2>
          <RouteMap spots={previewSpots} />
        </section>
      )}

      {/* 하단 액션 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-navy-200 bg-white px-6 py-3 text-sm text-navy-600 transition-colors hover:bg-navy-50"
        >
          취소
        </button>
        {spots.length >= 2 && (
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-lg border border-navy-200 bg-white px-6 py-3 text-sm text-navy-600 transition-colors hover:bg-navy-50"
          >
            {showPreview ? '미리보기 닫기' : '🗺️ 미리보기'}
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 rounded-lg bg-navy-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:bg-navy-300"
        >
          {isSubmitting
            ? '저장 중...'
            : isEditMode
              ? '코스 수정'
              : '코스 생성'}
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
