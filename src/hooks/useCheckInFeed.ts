'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CheckIn, Badge } from '@/types'

/**
 * useCheckInFeed 훅
 * 실시간 피드 탭의 체크인 데이터 fetching 및 무한 스크롤 로직
 *
 * Requirements:
 * - 3.2: 실시간 피드 탭에서 최신순 정렬된 체크인 표시
 * - 6.3: 기존 CheckInGallery 컴포넌트의 데이터 fetching 로직 통합
 */

/** 스팟 정보 인터페이스 */
export interface SpotInfo {
  id: string
  name: string
}

/** 스팟 정보가 포함된 체크인 인터페이스 */
export interface CheckInWithSpot extends CheckIn {
  spot?: SpotInfo
  badges?: Badge[]
}

/** 체크인 API 응답 인터페이스 */
interface CheckInsResponse {
  checkins: CheckIn[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** useCheckInFeed 훅 옵션 */
export interface UseCheckInFeedOptions {
  /** 페이지당 아이템 수 (기본값: 20) */
  itemsPerPage?: number
  /** 정렬 방식 (기본값: 'latest') */
  sortBy?: 'latest' | 'popular'
  /** 특정 스팟 ID로 필터링 */
  spotId?: string
  /** 특정 유저 ID로 필터링 */
  userId?: string
  /** 특정 작품명으로 필터링 (Requirements 3.5) */
  contentName?: string
  /** 자동 로드 활성화 여부 (기본값: true) */
  enabled?: boolean
}

/** useCheckInFeed 훅 반환 타입 */
export interface UseCheckInFeedReturn {
  /** 체크인 목록 (스팟 정보 포함) */
  checkIns: CheckInWithSpot[]
  /** 초기 로딩 상태 */
  isLoading: boolean
  /** 추가 로딩 상태 (무한 스크롤) */
  isLoadingMore: boolean
  /** 에러 메시지 */
  error: string | null
  /** 더 불러올 데이터 존재 여부 */
  hasMore: boolean
  /** 다음 페이지 로드 함수 */
  loadMore: () => void
  /** 데이터 새로고침 함수 */
  refresh: () => void
  /** 무한 스크롤 트리거 ref */
  loadMoreRef: React.RefObject<HTMLDivElement | null>
}

const DEFAULT_ITEMS_PER_PAGE = 20

/**
 * 체크인 피드 데이터 fetching 및 무한 스크롤 훅
 *
 * @param options - 훅 옵션
 * @returns 체크인 데이터 및 상태
 *
 * @example
 * ```tsx
 * const { checkIns, isLoading, hasMore, loadMoreRef } = useCheckInFeed({
 *   itemsPerPage: 20,
 *   sortBy: 'latest'
 * })
 *
 * // 작품별 필터링 (Requirements 3.5)
 * const { checkIns } = useCheckInFeed({
 *   contentName: '너의 이름은'
 * })
 * ```
 */
export function useCheckInFeed(
  options: UseCheckInFeedOptions = {}
): UseCheckInFeedReturn {
  const {
    itemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    sortBy = 'latest',
    spotId,
    userId,
    contentName,
    enabled = true,
  } = options

  const [checkIns, setCheckIns] = useState<CheckInWithSpot[]>([])
  const [spotMap, setSpotMap] = useState<Map<string, SpotInfo>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Intersection Observer를 위한 ref
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  /**
   * 스팟 정보 조회
   * 캐시된 스팟 정보를 활용하여 중복 요청 방지
   */
  const fetchSpotInfo = useCallback(
    async (spotIds: string[]): Promise<Map<string, SpotInfo>> => {
      const uniqueIds = [...new Set(spotIds)]
      const newSpotMap = new Map<string, SpotInfo>()

      // 이미 캐시된 스팟은 제외
      const idsToFetch = uniqueIds.filter((id) => !spotMap.has(id))

      if (idsToFetch.length === 0) {
        return spotMap
      }

      try {
        // 각 스팟 정보를 개별 조회 (배치 API가 없으므로)
        const spotPromises = idsToFetch.map(async (spotIdToFetch) => {
          try {
            const res = await fetch(`/api/spots/${spotIdToFetch}`)
            if (res.ok) {
              const data = await res.json()
              return { id: spotIdToFetch, name: data.name || '알 수 없는 스팟' }
            }
          } catch {
            // 개별 스팟 조회 실패는 무시
          }
          return { id: spotIdToFetch, name: '알 수 없는 스팟' }
        })

        const spots = await Promise.all(spotPromises)
        spots.forEach((spot) => {
          newSpotMap.set(spot.id, spot)
        })

        // 기존 캐시와 병합
        const mergedMap = new Map([...spotMap, ...newSpotMap])
        setSpotMap(mergedMap)
        return mergedMap
      } catch {
        return spotMap
      }
    },
    [spotMap]
  )

  /**
   * 체크인 목록 조회
   * sortBy=latest로 최신순 정렬 (Requirements 3.2)
   * contentName으로 작품별 필터링 (Requirements 3.5)
   */
  const fetchCheckIns = useCallback(
    async (pageNum: number, isInitial = false) => {
      if (isInitial) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      try {
        // URL 파라미터 구성
        const params = new URLSearchParams({
          sortBy,
          page: pageNum.toString(),
          limit: itemsPerPage.toString(),
        })

        if (spotId) {
          params.set('spotId', spotId)
        }
        if (userId) {
          params.set('userId', userId)
        }
        if (contentName) {
          params.set('contentName', contentName)
        }

        const res = await fetch(`/api/checkins?${params.toString()}`)

        if (!res.ok) {
          throw new Error('체크인 목록 조회 실패')
        }

        const data: CheckInsResponse = await res.json()

        // 스팟 정보 조회
        const spotIds = data.checkins.map((c) => c.spotId)
        const updatedSpotMap = await fetchSpotInfo(spotIds)

        // 체크인에 스팟 정보 추가
        const checkInsWithSpot: CheckInWithSpot[] = data.checkins.map(
          (checkIn) => ({
            ...checkIn,
            spot: updatedSpotMap.get(checkIn.spotId) || {
              id: checkIn.spotId,
              name: '알 수 없는 스팟',
            },
          })
        )

        if (isInitial) {
          setCheckIns(checkInsWithSpot)
        } else {
          setCheckIns((prev) => [...prev, ...checkInsWithSpot])
        }

        setHasMore(pageNum < data.totalPages)
        setPage(pageNum)
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [fetchSpotInfo, sortBy, itemsPerPage, spotId, userId, contentName]
  )

  /**
   * 다음 페이지 로드
   */
  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchCheckIns(page + 1, false)
    }
  }, [isLoading, isLoadingMore, hasMore, page, fetchCheckIns])

  /**
   * 데이터 새로고침
   */
  const refresh = useCallback(() => {
    setCheckIns([])
    setPage(1)
    setHasMore(true)
    fetchCheckIns(1, true)
  }, [fetchCheckIns])

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    if (enabled) {
      fetchCheckIns(1, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sortBy, spotId, userId, contentName])

  /**
   * Intersection Observer 설정 (무한 스크롤)
   * Requirements 2.5: 무한 스크롤 구현
   */
  useEffect(() => {
    // 이전 observer 정리
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // 새 observer 생성
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          fetchCheckIns(page + 1, false)
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    )

    // loadMore 요소 관찰
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, isLoadingMore, page, fetchCheckIns])

  return {
    checkIns,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    loadMoreRef,
  }
}

export default useCheckInFeed
