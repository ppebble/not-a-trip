'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { SpotReportForm } from '@/components/report/SpotReportForm'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import Link from 'next/link'

/**
 * 신규 성지 제보 페이지
 * Requirements: 1.1
 */
export default function NewReportPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()

  // 로딩 중
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="border-b border-neutral-200 bg-surface px-4 py-4">
          <div className="mx-auto max-w-lg">
            <div className="h-6 w-32 animate-pulse rounded bg-surface" />
          </div>
        </div>
        <div className="mx-auto max-w-lg px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-primary-50"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 미인증 시 로그인 모달
  if (!isAuthenticated || !user) {
    return (
      <LoginRequiredModal
        isOpen={true}
        title="로그인이 필요한 서비스입니다"
        description="성지 제보를 하려면 로그인이 필요합니다."
        onConfirm={() => router.push('/auth/signin')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <div className="border-b border-neutral-200 bg-surface px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/reports"
            className="hover:text-text-primary flex items-center gap-2 text-sm text-secondary"
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
            내 제보 목록
          </Link>
          <h1 className="mt-2 text-xl font-bold text-primary">새 성지 제보</h1>
          <p className="mt-1 text-sm text-muted">
            발견한 성지를 제보하여 다른 유저들과 공유하세요
          </p>
        </div>
      </div>

      {/* 제보 폼 */}
      <main className="px-4 py-6">
        <SpotReportForm />
      </main>
    </div>
  )
}
