'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { AppIcon } from '@/components/common/AppIcon'

interface HeaderAuthControlsProps {
  mobileMenuOpen?: boolean
  onMobileNavigate?: () => void
}

export default function HeaderAuthControls({
  mobileMenuOpen = false,
  onMobileNavigate,
}: HeaderAuthControlsProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (mobileMenuOpen) {
    return (
      <>
        {isAuthenticated && user?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={onMobileNavigate}
            className="block rounded-lg px-3 py-2 text-sm text-orange-400 transition hover:bg-secondary-100 hover:text-orange-300"
          >
            관리자
          </Link>
        )}
        {isAuthenticated && user && (
          <Link
            href={`/profile/${user.id}`}
            onClick={onMobileNavigate}
            className="text-text-secondary hover:text-text-primary flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-secondary-100"
          >
            <AppIcon name="profile" size="sm" />
            마이페이지
          </Link>
        )}
      </>
    )
  }

  if (isLoading) {
    return <div className="h-8 w-20 animate-pulse rounded bg-muted/30" />
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href={`/profile/${user.id}`}
          className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-secondary-100"
        >
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || '프로필'}
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
              referrerPolicy={
                user.image.startsWith('http') ? 'no-referrer' : undefined
              }
              unoptimized={!user.image.startsWith('http')}
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
    )
  }

  return (
    <Link
      href="/auth/signin"
      className="rounded-lg bg-primary px-3 py-1.5 text-sm text-white transition hover:bg-primary-600"
    >
      로그인
    </Link>
  )
}
