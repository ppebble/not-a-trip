'use client'

import { useState, useEffect } from 'react'
import { usePwaStore } from '@/stores/pwaStore'

/**
 * 데스크탑 전용 PWA 설치 토스트 팝업
 * 우측 하단에 설치 안내를 표시한다.
 * mounted 상태 패턴으로 Hydration 에러를 방지한다.
 * @requirements 5.3, 5.8, 5.9
 */
export function InstallToast() {
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

  // 데스크탑에서만 표시 (768px 이상)
  const isDesktop = window.matchMedia('(min-width: 768px)').matches
  if (!isDesktop) return null

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
      className="animate-slide-up fixed bottom-4 right-4 z-40 w-80 rounded-xl border border-border bg-surface p-4 shadow-xl"
      role="dialog"
      aria-label="앱 설치 안내"
    >
      {/* 헤더 */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛂</span>
          <p className="text-sm font-bold text-main-text">
            Not a Trip 여권 발급받기
          </p>
        </div>
        <button
          onClick={dismiss}
          className="flex-shrink-0 p-0.5 text-muted transition-colors hover:text-main-text"
          aria-label="설치 안내 닫기"
        >
          <svg
            className="h-4 w-4"
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

      <p className="mb-3 text-xs text-sub-text">
        앱을 설치하면 더 빠르고 편리하게 특별한 여행지를 탐색할 수 있어요
      </p>

      {/* 설치 버튼 */}
      <button
        onClick={handleInstall}
        className="w-full rounded-lg bg-primary py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 active:scale-[0.98]"
      >
        여권 발급받기 (앱 설치)
      </button>
    </div>
  )
}
