'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { RouteDetailContent } from '@/components/route/RouteDetailContent'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

/** 코스 상세 페이지 스켈레톤 */
function RouteDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <SkeletonBlock className="mb-2 h-5 w-24" />
        <SkeletonBlock className="mb-3 h-8 w-2/3" />
        <SkeletonBlock className="mb-4 h-4 w-full" />
        <div className="flex gap-3">
          <SkeletonBlock className="h-4 w-16" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-4 w-16" />
        </div>
      </div>
      <div className="flex gap-3">
        <SkeletonBlock className="h-12 flex-1" />
        <SkeletonBlock className="h-12 w-24" />
      </div>
      <SkeletonBlock className="h-[400px] rounded-lg" />
    </div>
  )
}

/**
 * 코스 상세 페이지 클라이언트 컴포넌트
 * Requirements: 1.4, 2.3, 2.4, 3.1
 */
export default function RouteDetailClient() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string

  const [route, setRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoute() {
      try {
        const res = await fetch(`/api/routes/${routeId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || '코스를 불러올 수 없습니다')
          return
        }
        const data = await res.json()
        setRoute(data)
      } catch {
        setError('코스를 불러올 수 없습니다')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoute()
  }, [routeId])

  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href="/routes"
            className="text-sm text-navy-500 transition-colors hover:text-navy-700"
          >
            ← 코스 목록으로
          </Link>
        </div>

        {isLoading ? (
          <RouteDetailSkeleton />
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-lg text-red-500">{error}</p>
            <button
              onClick={() => router.push('/routes')}
              className="mt-4 rounded-lg bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-700"
            >
              코스 목록으로 돌아가기
            </button>
          </div>
        ) : route ? (
          <RouteDetailContent route={route} />
        ) : null}
      </div>
    </main>
  )
}
