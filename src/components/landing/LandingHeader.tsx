import Link from 'next/link'
import { AppIcon } from '@/components/common/AppIcon'
import HeaderThemeSelectorHost from '@/components/layout/HeaderThemeSelectorHost'

/**
 * 랜딩 페이지 전용 미니 헤더
 * 로고 / 테마 선택 / 지도 탐색 / 로그인 CTA를 노출한다.
 */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 md:px-6">
      <Link href="/" className="flex items-center gap-2">
        <AppIcon name="logo" size="2xl" className="max-h-8" />
        <span className="text-lg font-semibold tracking-[-0.01em] text-main-text dark:text-white">
          Not a Trip
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        <HeaderThemeSelectorHost />
        <Link
          href="/map"
          className="hidden rounded-full border border-border bg-surface/85 px-4 py-1.5 text-sm font-medium text-main-text shadow-sm backdrop-blur-sm transition hover:border-primary-500/40 hover:bg-primary-50 dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 sm:block"
        >
          지도 탐색
        </Link>
        <Link
          href="/auth/signin"
          className="rounded-full bg-primary-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/20 transition hover:bg-primary-600"
        >
          로그인
        </Link>
      </div>
    </header>
  )
}
