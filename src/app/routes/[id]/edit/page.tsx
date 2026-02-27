'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { RouteFormContent } from '@/components/route/RouteFormContent'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import type { Route } from '@/types/route'

/**
 * 코스 수정 페이지
 * - 기존 데이터로 폼 프리필
 * - 작성자만 접근 가능
 * Requirements: 1.2
 */
export default function RouteEditPage() {
  const params = useParams()
  const router = useRouter()
  const routeId = params.id as string
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()

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
        const data: Route = await res.json()
        setRoute(data)
      } catch {
        setError('코스를 불러올 수 없습니다')
      } finally {
        setIsLoading(false)
      }
    }
    fetchRoute()
  }, [routeId])

  // 작성자 권한 확인
  useEffect(() => {
    if (isAuthLoading || isLoading) return
    if (!isAuthenticated) {
      router.push('/auth/signin')
      return
    }
    if (route && user && route.authorId !== user.id) {
      setError('권한이 없습니다')
    }
  }, [isAuthLoading, isLoading, isAuthenticated, route, user, router])

  const isAuthor = route && user && route.authorId === user.id

  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href={`/routes/${routeId}`}
            className="text-sm text-navy-500 transition-colors hover:text-navy-700"
          >
            ← 코스 상세로
          </Link>
        </div>

        {isLoading || isAuthLoading ? (
          <div className="space-y-6">
            <SkeletonBlock className="h-8 w-48" />
            <SkeletonBlock className="h-64 w-full rounded-lg" />
            <SkeletonBlock className="h-48 w-full rounded-lg" />
          </div>
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
        ) : route && isAuthor ? (
          <>
            <h1 className="mb-6 text-2xl font-bold text-navy-900">
              ✏️ 코스 수정
            </h1>
            <RouteFormContent initialRoute={route} isEditMode />
          </>
        ) : null}
      </div>
    </main>
  )
}
