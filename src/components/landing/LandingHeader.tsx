import Link from 'next/link'
import { AppIcon } from '@/components/common/AppIcon'

/**
 * 랜딩 페이지 전용 미니 헤더
 * 로고 / 지도 탐색 / 로그인 CTA만 정적으로 노출한다.
 */
export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4">
      <Link href="/" className="flex items-center gap-2">
        <AppIcon name="logo" size="2xl" className="max-h-8" />
        <span className="text-lg font-bold text-white">Not a Trip</span>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/map"
          className="hidden rounded-lg border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20 sm:block"
        >
          지도 탐색
        </Link>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-primary-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-600"
        >
          로그인
        </Link>
      </div>
    </header>
  )
}
