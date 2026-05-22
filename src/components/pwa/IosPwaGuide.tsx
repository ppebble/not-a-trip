'use client'

import { useEffect, useState } from 'react'
import { useIsInstalled } from '@/stores/pwaStore'
import { isIosSafari } from '@/lib/pwa-utils'
import { MascotIllustration } from '@/components/common'

const IOS_DISMISS_KEY = 'not-a-trip-ios-guide-dismissed'

/**
 * iOS Safari에서 홈 화면 추가 방법을 안내하는 가이드 컴포넌트
 * beforeinstallprompt를 지원하지 않는 iOS Safari 환경에서만 표시된다.
 * @requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */
export function IosPwaGuide() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const installed = useIsInstalled()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(IOS_DISMISS_KEY)
      if (stored === 'true') {
        setDismissed(true)
      }
    } catch {
      // private mode 등에서 localStorage 접근 실패 시 무시
    }

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    setMounted(true)
  }, [])

  if (!mounted) return null
  if (installed || isStandalone) return null
  if (!isIosSafari()) return null
  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(IOS_DISMISS_KEY, 'true')
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }

  return (
    <div
      className="animate-slide-up fixed inset-x-0 bottom-0 z-[1100] rounded-t-3xl border-t border-border bg-surface px-4 pb-safe-bottom pt-4 shadow-2xl md:bottom-auto md:left-auto md:right-4 md:top-4 md:w-[360px] md:rounded-3xl md:border"
      role="dialog"
      aria-label="iOS 앱 설치 안내"
    >
      <div className="mb-3 flex justify-center md:hidden">
        <div className="h-1 w-10 rounded-full bg-muted" />
      </div>

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-text-secondary mb-2 inline-flex items-center gap-2 rounded-full bg-accent-surface px-3 py-1 text-xs font-medium">
            <span className="text-base">🍎</span>
            iPhone / iPad 설치 안내
          </div>
          <h2 className="text-text text-base font-bold">
            Not a Trip을 홈 화면에 추가하세요
          </h2>
          <p className="text-text-secondary mt-1 text-sm leading-5">
            Safari에서는 공유 메뉴에서 직접 설치해야 더 빠르게 지도를 열 수
            있습니다.
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="hover:text-text flex-shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-accent-surface"
          aria-label="설치 안내 닫기"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mb-4 flex items-center gap-4 rounded-2xl bg-accent-surface px-4 py-3">
        <MascotIllustration variant="greeting" size="sm" className="shrink-0" />
        <p className="text-text-secondary text-xs leading-5">
          설치 후에는 브라우저 주소창 없이 바로 열리고, 지도와 성지 탐색이 더
          앱처럼 동작합니다.
        </p>
      </div>

      <ol className="space-y-3">
        <GuideStep
          number={1}
          icon="⤴️"
          title="Safari 하단의 공유 버튼 선택"
          description="화면 아래의 공유 아이콘을 눌러 설치 메뉴를 엽니다."
        />
        <GuideStep
          number={2}
          icon="➕"
          title="'홈 화면에 추가' 선택"
          description="공유 메뉴를 아래로 내려 '홈 화면에 추가' 항목을 찾습니다."
        />
        <GuideStep
          number={3}
          icon="✅"
          title="'추가'를 눌러 설치 완료"
          description="홈 화면에 앱 아이콘이 생기면 다음부터는 앱처럼 바로 열 수 있습니다."
        />
      </ol>

      <button
        onClick={handleDismiss}
        className="text-text-secondary hover:text-text mt-4 w-full rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent-surface"
      >
        다시 보지 않기
      </button>
    </div>
  )
}

function GuideStep({
  number,
  icon,
  title,
  description,
}: {
  number: number
  icon: string
  title: string
  description: string
}) {
  return (
    <li className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
        {number}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <p className="text-text text-sm font-semibold">{title}</p>
        </div>
        <p className="text-text-secondary mt-1 text-xs leading-5">
          {description}
        </p>
      </div>
    </li>
  )
}
