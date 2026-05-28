'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AppIcon } from '@/components/common/AppIcon'

interface HeaderAuthControlsProps {
  mobileMenuOpen?: boolean
  onMobileNavigate?: () => void
}

function getAdminLinkClass(isActive: boolean, mobile = false) {
  const base = mobile
    ? 'flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-base font-semibold transition hover:bg-sunset-50 hover:text-sunset-600 dark:hover:bg-sunset-500/15 dark:hover:text-sunset-600'
    : 'rounded-xl px-3 py-2 text-base font-semibold transition hover:bg-sunset-50 hover:text-sunset-600 dark:hover:bg-sunset-500/15 dark:hover:text-sunset-600'

  return `${base} ${
    isActive
      ? 'bg-sunset-50 text-sunset-600 dark:bg-sunset-500/15 dark:text-sunset-600'
      : 'text-sunset-500 dark:text-sunset-600'
  }`
}

export default function HeaderAuthControls({
  mobileMenuOpen = false,
  onMobileNavigate,
}: HeaderAuthControlsProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const pathname = usePathname()
  const isAdmin = isAuthenticated && user?.role === 'admin'
  const isAdminActive = pathname === '/admin' || pathname.startsWith('/admin/')

  if (mobileMenuOpen) {
    return (
      <div className="space-y-1">
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onMobileNavigate}
            className={getAdminLinkClass(isAdminActive, true)}
            aria-current={isAdminActive ? 'page' : undefined}
          >
            <AppIcon name="settings" size="sm" alt="" />
            어드민
          </Link>
        )}
        {isAuthenticated && user ? (
          <>
            <Link
              href={`/profile/${user.id}`}
              onClick={onMobileNavigate}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-base font-medium text-text-secondary transition hover:bg-secondary-100 hover:text-text-primary"
            >
              <AppIcon name="profile" size="sm" alt="" />
              마이페이지
            </Link>
            <button
              onClick={() => {
                onMobileNavigate?.()
                logout()
              }}
              className="block w-full rounded-xl px-3.5 py-3 text-left text-base font-medium text-text-secondary transition hover:bg-secondary-100 hover:text-text-primary"
            >
              로그아웃
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            onClick={onMobileNavigate}
            className="block rounded-xl bg-primary px-3.5 py-3 text-base font-semibold text-white transition hover:bg-primary-600"
          >
            로그인
          </Link>
        )}
      </div>
    )
  }

  if (isLoading) {
    return <div className="h-10 w-24 animate-pulse rounded-xl bg-muted/30" />
  }

  if (isAuthenticated && user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        {isAdmin && (
          <Link
            href="/admin"
            className={getAdminLinkClass(isAdminActive)}
            aria-current={isAdminActive ? 'page' : undefined}
          >
            어드민
          </Link>
        )}
        <Link
          href={`/profile/${user.id}`}
          className="flex items-center gap-2 rounded-xl px-2.5 py-2 transition hover:bg-secondary-100"
          aria-label="마이페이지로 이동"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || '프로필 이미지'}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy={
                user.image.startsWith('http') ? 'no-referrer' : undefined
              }
              unoptimized={!user.image.startsWith('http')}
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-secondary-100">
              <AppIcon name="profile-front" size="xl" alt="" />
            </div>
          )}
          <span className="hidden max-w-32 truncate text-base font-medium text-text-secondary xl:block">
            {user.name || user.email}
          </span>
        </Link>
        <button
          onClick={() => logout()}
          className="rounded-xl bg-neutral-300 px-4 py-2 text-base font-semibold text-white transition hover:bg-neutral-400"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="hidden rounded-xl bg-primary px-4 py-2 text-base font-semibold text-white transition hover:bg-primary-600 sm:inline-flex"
    >
      로그인
    </Link>
  )
}
