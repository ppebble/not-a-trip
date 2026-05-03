'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { ThemeSelector } from '@/components/common/ThemeToggle'
import { AppIcon } from '@/components/common/AppIcon'

export function Header() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleResetTour = () => {
    try {
      // 모든 페이지별 온보딩 키 초기화
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith('not-a-trip-onboarding')
      )
      keys.forEach((k) => localStorage.removeItem(k))
      window.location.reload()
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-[1100] border-b border-border bg-surface/95 pt-safe-top backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-text-primary flex items-center gap-1.5 text-xl font-bold">
            <AppIcon name="logo" size="2xl" className="max-h-8" />
            Not a Trip
          </span>
        </Link>

        {/* 데스크톱 네비게이션 */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-text-secondary text-sm transition hover:text-secondary-400"
          >
            홈
          </Link>
          <Link
            href="/gallery"
            className="text-text-secondary text-sm transition hover:text-secondary-400"
          >
            순례 인증
          </Link>
          <Link
            href="/routes"
            className="text-text-secondary text-sm transition hover:text-secondary-400"
          >
            순례 코스
          </Link>
          <Link
            href="/spots/register"
            className="text-text-secondary text-sm transition hover:text-secondary-400"
          >
            스팟 등록
          </Link>
          <button
            onClick={handleResetTour}
            className="text-text-secondary text-sm transition hover:text-secondary-400"
          >
            📖 가이드 다시 보기
          </button>
          <Link
            href="/test/globe-fallback"
            className="text-sm text-yellow-400 transition hover:text-yellow-300"
          >
            🧪 테스트
          </Link>
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-sm text-orange-400 transition hover:text-orange-300"
            >
              ⚙️ 관리자
            </Link>
          )}
        </nav>

        {/* 인증 영역 + 모바일 메뉴 버튼 */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse rounded bg-muted/30" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings/account"
                className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-secondary-100"
              >
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || '프로필'}
                    width={28}
                    height={28}
                    className="h-7 w-7 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
                    <AppIcon name="profile-front" size="xl" />
                  </div>
                )}
                <span className="text-text-secondary hidden text-sm sm:block">
                  {user.name || user.email}
                </span>
              </Link>
              <button
                onClick={() => logout()}
                className="rounded-lg bg-neutral-300 px-3 py-1.5 text-sm text-white transition hover:bg-neutral-400"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition hover:bg-primary-600"
            >
              로그인
            </Link>
          )}

          {/* 테마 토글 */}
          <ThemeSelector />

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-text-secondary hover:text-text-primary flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-secondary-100 md:hidden"
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
        <nav className="border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-secondary hover:text-text-primary block rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
            >
              홈
            </Link>
            <Link
              href="/gallery"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
            >
              <AppIcon name="gallery" size="sm" />
              순례 인증
            </Link>
            <Link
              href="/routes"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
            >
              <AppIcon name="map" size="sm" />
              순례 코스
            </Link>
            <Link
              href="/spots/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-text-secondary hover:text-text-primary block rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
            >
              스팟 등록
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleResetTour()
              }}
              className="text-text-secondary hover:text-text-primary block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary-100"
            >
              📖 가이드 다시 보기
            </button>
            <Link
              href="/test/globe-fallback"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-yellow-400 transition hover:bg-secondary-100 hover:text-yellow-300"
            >
              🧪 테스트
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm text-orange-400 transition hover:bg-secondary-100 hover:text-orange-300"
              >
                ⚙️ 관리자
              </Link>
            )}
            {isAuthenticated && (
              <Link
                href="/settings/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
              >
                <AppIcon name="profile" size="sm" />
                계정 설정
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
