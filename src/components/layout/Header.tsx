'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppIcon } from '@/components/common/AppIcon'
import { MASCOT_ASSETS } from '@/components/common/mascotAssets'

type NavItem = {
  href: string
  label: string
  icon?: 'gallery' | 'map' | 'spot' | 'content-wise'
  match?: (pathname: string) => boolean
}

const HeaderAuthControls = dynamic(() => import('./HeaderAuthControls'), {
  ssr: false,
  loading: () => (
    <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/30" />
  ),
})

const HeaderThemeSelectorHost = dynamic(
  () => import('./HeaderThemeSelectorHost'),
  {
    ssr: false,
    loading: () => <div className="h-10 w-10" aria-hidden="true" />,
  }
)

const HIDDEN_HEADER_PATHS = ['/welcome']

const PRIMARY_NAV_ITEMS: NavItem[] = [
  {
    href: '/contents',
    label: '작품',
    icon: 'content-wise',
    match: (pathname) => pathname.startsWith('/contents'),
  },
  {
    href: '/map',
    label: '장소',
    icon: 'map',
    match: (pathname) => pathname === '/map',
  },
  {
    href: '/routes',
    label: '코스',
    icon: 'map',
    match: (pathname) => pathname.startsWith('/routes'),
  },
]

const PARTICIPATION_NAV_ITEMS: NavItem[] = [
  {
    href: '/gallery',
    label: '방문 기록',
    icon: 'gallery',
    match: (pathname) => pathname.startsWith('/gallery'),
  },
  {
    href: '/spots/register',
    label: '장소 제보',
    icon: 'spot',
    match: (pathname) => pathname.startsWith('/spots/register'),
  },
]

function isNavItemActive(item: NavItem, pathname: string) {
  return item.match?.(pathname) ?? pathname === item.href
}

function getNavLinkClass(isActive: boolean, mobile = false) {
  const base = mobile
    ? 'flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-base font-medium transition hover:bg-accent-surface hover:text-text-primary dark:hover:bg-secondary-500/15 dark:hover:text-secondary-600'
    : 'rounded-xl px-3 py-2 text-base font-medium transition hover:bg-accent-surface hover:text-text-primary dark:hover:bg-secondary-500/15 dark:hover:text-secondary-600'

  return `${base} ${
    isActive
      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-200 dark:bg-secondary-500/15 dark:text-secondary-600 dark:ring-secondary-500/20'
      : 'text-text-secondary'
  }`
}

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

  const closeMobileMenu = () => setIsMobileMenuOpen(false)
  const isParticipationActive = PARTICIPATION_NAV_ITEMS.some((item) =>
    isNavItemActive(item, pathname)
  )

  return (
    <>
      <div className="h-16" aria-hidden="true" />
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-border bg-surface/95 pt-safe-top backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-5">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 rounded-xl py-1 pr-2 transition hover:opacity-90"
            aria-label="Not a Trip 홈으로 이동"
          >
            <Image
              src={MASCOT_ASSETS.lookout}
              alt="Not a Trip"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
            />
            <span className="truncate text-xl font-bold text-text-primary sm:text-2xl">
              Not a Trip
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="주요 메뉴"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const isActive = isNavItemActive(item, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={getNavLinkClass(isActive)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              )
            })}
            <span className="mx-2 h-5 w-px bg-border" aria-hidden="true" />
            <details className="group relative">
              <summary
                className={`${getNavLinkClass(isParticipationActive)} flex cursor-pointer list-none items-center gap-1.5 [&::-webkit-details-marker]:hidden`}
                aria-label="참여 메뉴 열기"
              >
                참여
                <svg
                  className="h-4 w-4 transition group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 9 6 6 6-6"
                  />
                </svg>
              </summary>
              <div className="absolute right-0 top-[calc(100%+0.5rem)] w-48 rounded-2xl border border-border bg-surface p-2 shadow-lg">
                <p className="text-text-tertiary px-3 pb-1 pt-2 text-xs font-semibold">
                  정보에 참여하기
                </p>
                {PARTICIPATION_NAV_ITEMS.map((item) => {
                  const isActive = isNavItemActive(item, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={getNavLinkClass(isActive, true)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon && (
                        <AppIcon name={item.icon} size="sm" alt="" />
                      )}
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </details>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderAuthControls />
            <HeaderThemeSelectorHost />

            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-text-secondary transition hover:bg-secondary-100 hover:text-text-primary lg:hidden"
              aria-label={isMobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-header-menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
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
          <nav
            id="mobile-header-menu"
            className="border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden"
            aria-label="모바일 메뉴"
          >
            <div className="px-4 py-3">
              <p className="text-text-tertiary px-3.5 pb-1 pt-1 text-xs font-semibold">
                정보 탐색
              </p>
              <div className="space-y-1">
                {PRIMARY_NAV_ITEMS.map((item) => {
                  const isActive = isNavItemActive(item, pathname)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={getNavLinkClass(isActive, true)}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon && (
                        <AppIcon name={item.icon} size="sm" alt="" />
                      )}
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <div className="mt-3 border-t border-border pt-3">
                <p className="text-text-tertiary px-3.5 pb-1 text-xs font-semibold">
                  참여
                </p>
                <div className="space-y-1">
                  {PARTICIPATION_NAV_ITEMS.map((item) => {
                    const isActive = isNavItemActive(item, pathname)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={getNavLinkClass(isActive, true)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {item.icon && (
                          <AppIcon name={item.icon} size="sm" alt="" />
                        )}
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="mt-3 border-t border-border pt-2">
                <HeaderAuthControls
                  mobileMenuOpen
                  onMobileNavigate={closeMobileMenu}
                />
              </div>
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
