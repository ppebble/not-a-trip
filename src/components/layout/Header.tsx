'use client'

import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-700 bg-slate-900/95 pt-safe-top backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">✈️ Not a Trip</span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            홈
          </Link>
          <Link
            href="/gallery"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            순례 갤러리
          </Link>
          <Link
            href="/routes"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            순례 코스
          </Link>
          <Link
            href="/spots/register"
            className="text-sm text-slate-300 transition hover:text-white"
          >
            스팟 등록
          </Link>
          <Link
            href="/test/status-report"
            className="text-sm text-yellow-400 transition hover:text-yellow-300"
          >
            🧪 테스트
          </Link>
        </nav>

        {/* 인증 영역 */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-slate-700" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-slate-300 sm:block">
                {user.name || user.email}
              </span>
              <button
                onClick={() => logout()}
                className="rounded-lg bg-slate-700 px-3 py-1.5 text-sm text-white transition hover:bg-slate-600"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
