'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MyReportList } from '@/components/report/MyReportList'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import Link from 'next/link'

/**
 * 내 제보 목록 페이지
 * Requirements: 1.6, 2.2
 */
export default function MyReportsPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-lg">
            <div className="h-6 w-32 animate-pulse rounded bg-navy-100" />
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 py-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-navy-50"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <LoginRequiredModal
        isOpen={true}
        title="로그인이 필요한 서비스입니다"
        description="내 제보 목록을 확인하려면 로그인이 필요합니다."
        onConfirm={() => router.push('/auth/login')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
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
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            홈으로
          </Link>
          <div className="mt-2 flex items-center justify-between">
            <h1 className="text-xl font-bold text-navy-800">내 제보 목록</h1>
            <Link
              href="/reports/new"
              className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
            >
              새 제보
            </Link>
          </div>
        </div>
      </div>

      {/* 제보 목록 */}
      <main className="mx-auto max-w-lg px-4 py-6">
        <MyReportList />
      </main>
    </div>
  )
}
