'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppIcon } from '@/components/common/AppIcon'

const HeaderAuthControls = dynamic(() => import('./HeaderAuthControls'), {
  ssr: false,
  loading: () => <div className="h-8 w-20 animate-pulse rounded bg-muted/30" />,
})

const HeaderThemeSelectorHost = dynamic(
  () => import('./HeaderThemeSelectorHost'),
  {
    ssr: false,
    loading: () => <div className="h-9 w-9" aria-hidden="true" />,
  }
)

const HIDDEN_HEADER_PATHS = ['/welcome']

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  if (
    HIDDEN_HEADER_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )
  ) {
    return null
  }

  const handleResetTour = () => {
    try {
      const keys = Object.keys(localStorage).filter((k) =>
        k.startsWith('not-a-trip-onboarding')
      )
      keys.forEach((k) => localStorage.removeItem(k))
      window.location.reload()
    } catch {
      // localStorage 접근 실패는 무시
    }
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <>
      <div className="h-14" aria-hidden="true" />
      <header className="fixed left-0 right-0 top-0 z-[1100] border-b border-border bg-surface/95 pt-safe-top backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-text-primary flex items-center gap-1.5 text-xl font-bold">
              <AppIcon name="logo" size="2xl" className="max-h-8" />
              Not a Trip
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="text-text-secondary text-sm transition hover:text-secondary-400"
            >
              홈
            </Link>
            <Link
              href="/contents"
              className={`text-sm transition hover:text-secondary-400 ${
                pathname.startsWith('/contents')
                  ? 'font-semibold text-secondary-400'
                  : 'text-text-secondary'
              }`}
            >
              작품 탐색
            </Link>
            <Link
              href="/gallery"
              className="text-text-secondary text-sm transition hover:text-secondary-400"
            >
              성지 인증
            </Link>
            <Link
              href="/routes"
              className="text-text-secondary text-sm transition hover:text-secondary-400"
            >
              성지 코스
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
              온보딩 다시 보기
            </button>
            <Link
              href="/test/globe-fallback"
              className="text-sm text-yellow-400 transition hover:text-yellow-300"
            >
              Globe 테스트
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <HeaderAuthControls />
            <HeaderThemeSelectorHost />

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

        {isMobileMenuOpen && (
          <nav className="border-t border-border bg-surface/95 backdrop-blur-sm md:hidden">
            <div className="space-y-1 px-4 py-3">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="text-text-secondary hover:text-text-primary block rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
              >
                홈
              </Link>
              <Link
                href="/contents"
                onClick={closeMobileMenu}
                className={`block rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100 ${
                  pathname.startsWith('/contents')
                    ? 'font-semibold text-secondary-400'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                작품 탐색
              </Link>
              <Link
                href="/gallery"
                onClick={closeMobileMenu}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
              >
                <AppIcon name="gallery" size="sm" />
                성지 인증
              </Link>
              <Link
                href="/routes"
                onClick={closeMobileMenu}
                className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
              >
                <AppIcon name="map" size="sm" />
                성지 코스
              </Link>
              <Link
                href="/spots/register"
                onClick={closeMobileMenu}
                className="text-text-secondary hover:text-text-primary block rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
              >
                스팟 등록
              </Link>
              <button
                onClick={() => {
                  closeMobileMenu()
                  handleResetTour()
                }}
                className="text-text-secondary hover:text-text-primary block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-secondary-100"
              >
                온보딩 다시 보기
              </button>
              <Link
                href="/test/globe-fallback"
                onClick={closeMobileMenu}
                className="block rounded-lg px-3 py-2 text-sm text-yellow-400 transition hover:bg-secondary-100 hover:text-yellow-300"
              >
                Globe 테스트
              </Link>
              <HeaderAuthControls
                mobileMenuOpen
                onMobileNavigate={closeMobileMenu}
              />
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
