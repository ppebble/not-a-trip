'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-700 bg-slate-900/95 pt-safe-top backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">✈️ Not a Trip</span>
        </Link>

        {/* 데스크톱 네비게이션 */}
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
            href="/test/facility-filter"
            className="text-sm text-yellow-400 transition hover:text-yellow-300"
          >
            🧪 테스트
          </Link>
        </nav>

        {/* 인증 영역 + 모바일 메뉴 버튼 */}
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

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-slate-700 hover:text-white md:hidden"
            aria-label="메뉴 열기"
          >
            {isMobileMenuOpen ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {isMobileMenuOpen && (
        <nav className="border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              홈
            </Link>
            <Link
              href="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              순례 갤러리
            </Link>
            <Link
              href="/routes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              순례 코스
            </Link>
            <Link
              href="/spots/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              스팟 등록
            </Link>
            <Link
              href="/test/facility-filter"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-yellow-400 transition hover:bg-slate-800 hover:text-yellow-300"
            >
              🧪 테스트
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
