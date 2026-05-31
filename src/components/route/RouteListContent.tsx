'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { RouteCard } from '@/components/route/RouteCard'
import {
  RouteFilterBar,
  type RouteFilters,
} from '@/components/route/RouteFilterBar'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import { AppIcon } from '@/components/common/AppIcon'
import { useRouteList } from '@/hooks/useRouteQueries'
import type { Route } from '@/types/route'

const EMPTY_ROUTES: Route[] = []

function RouteCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
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

/**
 * RouteListContent - 코스 목록 콘텐츠
 * Requirements: 2.1, 2.2, 8.3
 */
export function RouteListContent() {
  const [filters, setFilters] = useState<RouteFilters>({
    sort: 'popular',
    contentName: '',
    regionTag: '',
  })
  const [page, setPage] = useState(1)
  const [allRoutes, setAllRoutes] = useState<Route[]>([])
  const observerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const [debouncedFilters, setDebouncedFilters] = useState(filters)

  // 필터 디바운스
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedFilters(filters)
      setPage(1)
      setAllRoutes([])
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [filters])

  const { data, isLoading } = useRouteList(debouncedFilters, page)

  const currentPageRoutes = data?.routes ?? EMPTY_ROUTES
  const totalPages = data?.totalPages ?? 1

  // 페이지 변경 시 누적
  const routes = useMemo(
    () =>
      page === 1 ? currentPageRoutes : [...allRoutes, ...currentPageRoutes],
    [allRoutes, currentPageRoutes, page]
  )

  // 무한 스크롤 IntersectionObserver
  useEffect(() => {
    const el = observerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && page < totalPages) {
          setAllRoutes(routes)
          setPage((p) => p + 1)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [page, totalPages, isLoading, routes])

  return (
    <div className="space-y-6">
      <RouteFilterBar filters={filters} onFiltersChange={setFilters} />

      {isLoading && routes.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="mb-4 flex justify-center">
            <AppIcon name="map" size={48} className="opacity-20" />
          </div>
          <p className="text-lg text-muted">코스가 없습니다</p>
          <p className="mt-1 text-sm text-neutral-300">
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

          {page < totalPages && (
            <div ref={observerRef} className="flex justify-center py-4">
              {isLoading && (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
