'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { RouteCard } from '@/components/route/RouteCard'
import {
  RouteFilterBar,
  type RouteFilters,
} from '@/components/route/RouteFilterBar'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

const PAGE_LIMIT = 12

/** 코스 카드 스켈레톤 */
function RouteCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-navy-200 bg-white shadow-sm">
      <SkeletonBlock className="h-40 w-full rounded-none" />
      <div className="p-4">
        <SkeletonBlock className="mb-2 h-5 w-3/4" />
        <SkeletonBlock className="mb-3 h-4 w-full" />
        <SkeletonBlock className="mb-3 h-4 w-1/2" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-4 w-12" />
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-14" />
        </div>
      </div>
    </div>
  )
}

interface RoutesResponse {
  routes: Route[]
  total: number
  page: number
  totalPages: number
}

/**
 * RouteListContent - 코스 목록 콘텐츠
 * RouteCard + RouteFilterBar + 무한 스크롤
 * Requirements: 2.1, 2.2
 */
export function RouteListContent() {
  const [filters, setFilters] = useState<RouteFilters>({
    sort: 'popular',
    contentName: '',
    regionTag: '',
  })
  const [routes, setRoutes] = useState<Route[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  /** API 호출 */
  const fetchRoutes = useCallback(
    async (pageNum: number, append: boolean) => {
      if (append) setIsLoadingMore(true)
      else setIsLoading(true)

      try {
        const params = new URLSearchParams({
          sort: filters.sort,
          page: String(pageNum),
          limit: String(PAGE_LIMIT),
        })
        if (filters.contentName) params.set('contentName', filters.contentName)
        if (filters.regionTag) params.set('regionTag', filters.regionTag)
        if (filters.minDuration)
          params.set('minDuration', String(filters.minDuration))
        if (filters.maxDuration)
          params.set('maxDuration', String(filters.maxDuration))

        const res = await fetch(`/api/routes?${params}`)
        if (!res.ok) throw new Error('fetch failed')
        const data: RoutesResponse = await res.json()

        if (append) {
          setRoutes((prev) => [...prev, ...data.routes])
        } else {
          setRoutes(data.routes)
        }
        setTotalPages(data.totalPages)
      } catch {
        // 에러 시 빈 상태 유지
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [filters]
  )

  /** 필터 변경 시 디바운스 후 리셋 */
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      fetchRoutes(1, false)
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [fetchRoutes])

  /** 무한 스크롤 IntersectionObserver */
  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && page < totalPages) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchRoutes(nextPage, true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [page, totalPages, isLoadingMore, fetchRoutes])

  return (
    <div className="space-y-6">
      <RouteFilterBar filters={filters} onFiltersChange={setFilters} />

      {/* 코스 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-navy-400">🗺️ 코스가 없습니다</p>
          <p className="mt-1 text-sm text-navy-300">
            필터를 변경하거나 새 코스를 만들어보세요
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>

          {/* 무한 스크롤 트리거 */}
          {page < totalPages && (
            <div ref={observerRef} className="flex justify-center py-4">
              {isLoadingMore && (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-navy-200 border-t-navy-600" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
