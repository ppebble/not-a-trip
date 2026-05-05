'use client'

import Link from 'next/link'
import { AppIcon } from '@/components/common/AppIcon'
import { useAuth } from '@/hooks/useAuth'

/**
 * 랜딩 페이지 전용 미니 헤더
 * 로고 / 지도 탐색 / 로그인 만 표시
 */
export function LandingHeader() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4">
      {/* 로고 */}
      <Link href="/" className="flex items-center gap-2">
        <AppIcon name="logo" size="2xl" className="max-h-8" />
        <span className="text-lg font-bold text-white">Not a Trip</span>
      </Link>

      {/* 우측 액션 */}
      <div className="flex items-center gap-3">
        <Link
          href="/map"
          className="hidden rounded-lg border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 sm:block"
        >
          지도 탐색
        </Link>
        {!isLoading && !isAuthenticated && (
          <Link
            href="/auth/signin"
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            로그인
          </Link>
        )}
        {!isLoading && isAuthenticated && (
          <Link
            href="/map"
            className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-600"
          >
            탐색 시작
          </Link>
        )}
      </div>
    </header>
  )
}
