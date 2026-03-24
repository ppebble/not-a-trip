'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { RouteDetailContent } from '@/components/route/RouteDetailContent'
import { SkeletonBlock } from '@/components/common/SkeletonUI'
import { AsyncBoundary } from '@/components/common/AsyncBoundary'
import { useRouteDetailSuspense } from '@/hooks/useRouteDetailViewModel'
import { ArrowLeftIcon, AlertTriangleIcon } from '@/components/icons'

/** 코스 상세 페이지 스켈레톤 */
function RouteDetailSkeleton() {
  return (
    <main className="bg-navy-50 min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4">
          <SkeletonBlock className="h-5 w-28" />
        </div>
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
      </div>
    </main>
  )
}

/** 코스 상세 에러 UI */
function RouteDetailError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <main className="bg-navy-50 min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="py-16 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
            <AlertTriangleIcon size={24} color="#dc2626" />
          </div>
          <p className="mt-4 text-lg text-red-500">{error.message}</p>
          <button
            onClick={reset}
            className="bg-navy-600 hover:bg-navy-700 mt-4 rounded-lg px-4 py-2 text-sm text-white"
          >
            다시 시도
          </button>
        </div>
      </div>
    </main>
  )
}

/**
 * 코스 상세 페이지 클라이언트 컴포넌트
 * AsyncBoundary로 감싸서 로딩/에러 상태를 선언적으로 처리
 * Requirements: 2.4, 2.5, 2.6, 7.3
 */
export default function RouteDetailClient() {
  const params = useParams()
  const routeId = params.id as string

  return (
    <AsyncBoundary
      pendingFallback={<RouteDetailSkeleton />}
      rejectedFallback={RouteDetailError}
    >
      <RouteDetailInner routeId={routeId} />
    </AsyncBoundary>
  )
}

/**
 * RouteDetailInner: useSuspenseQuery로 데이터를 가져오는 내부 컴포넌트
 * AsyncBoundary 내부에서만 사용 — 로딩/에러 상태는 경계로 위임
 */
function RouteDetailInner({ routeId }: { routeId: string }) {
  const { data: route } = useRouteDetailSuspense(routeId)

  return (
    <main className="bg-navy-50 min-h-screen pt-14">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href="/routes"
            className="text-navy-500 hover:text-navy-700 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeftIcon size="sm" />
            코스 목록으로
          </Link>
        </div>

        {route ? (
          <RouteDetailContent route={route} />
        ) : (
          <div className="py-16 text-center">
            <p className="text-lg text-gray-500">코스를 찾을 수 없습니다</p>
            <Link
              href="/routes"
              className="bg-navy-600 hover:bg-navy-700 mt-4 inline-block rounded-lg px-4 py-2 text-sm text-white"
            >
              코스 목록으로 돌아가기
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
