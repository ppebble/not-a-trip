'use client'

import { useState, useEffect } from 'react'
import { usePwaStore } from '@/stores/pwaStore'

/**
 * 모바일 전용 PWA 설치 바텀 시트
 * "Not a Trip 여권 발급받기 (앱 설치)" 문구와 설치/닫기 버튼을 제공한다.
 * mounted 상태 패턴으로 Hydration 에러를 방지한다.
 * @requirements 5.3, 5.4, 5.5, 5.7, 5.8, 5.9
 */
export function InstallBottomSheet() {
  const [mounted, setMounted] = useState(false)
  const isInstallable = usePwaStore((s) => s.isInstallable)
  const isInstalled = usePwaStore((s) => s.isInstalled)
  const isDismissed = usePwaStore((s) => s.isDismissed)
  const triggerInstall = usePwaStore((s) => s.triggerInstall)
  const dismiss = usePwaStore((s) => s.dismiss)

  useEffect(() => {
    setMounted(true)
  }, [])

  // SSR 시점에는 null 반환 → Hydration 불일치 방지
  if (!mounted) return null

  // 모바일에서만 표시 (768px 미만)
  const isMobile = window.matchMedia('(max-width: 767px)').matches
  if (!isMobile) return null

  // standalone 모드 시 미표시
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  if (isStandalone) return null

  // 설치 불가, 이미 설치됨, 사용자가 닫은 경우 미표시
  if (!isInstallable || isInstalled || isDismissed) return null

  const handleInstall = async () => {
    await triggerInstall()
  }

  return (
    <div
      className="animate-slide-up fixed inset-x-0 bottom-0 z-40 rounded-t-2xl border-t border-border bg-surface px-4 pb-safe-bottom pt-4 shadow-2xl"
      role="dialog"
      aria-label="앱 설치 안내"
    >
      {/* 드래그 핸들 (시각적 요소) */}
      <div className="mb-3 flex justify-center">
        <div className="h-1 w-10 rounded-full bg-muted" />
      </div>

      {/* 콘텐츠 */}
      <div className="flex items-center gap-3">
        {/* 아이콘 */}
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-100 text-2xl">
          🛂
        </div>

        {/* 텍스트 */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-main-text">
            Not a Trip 여권 발급받기
          </p>
          <p className="text-xs text-sub-text">
            앱 설치로 더 빠르게 탐색하세요
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-1 text-muted transition-colors hover:text-main-text"
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

      {/* 설치 버튼 */}
      <button
        onClick={handleInstall}
        className="mb-2 mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600 active:scale-[0.98]"
      >
        여권 발급받기 (앱 설치)
      </button>
    </div>
  )
}
