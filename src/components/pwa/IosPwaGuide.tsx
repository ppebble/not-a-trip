'use client'

import { useState, useEffect } from 'react'

const IOS_DISMISS_KEY = 'not-a-trip-ios-guide-dismissed'

/**
 * iOS Safari에서 홈 화면 추가 방법을 안내하는 가이드 컴포넌트
 * beforeinstallprompt를 지원하지 않는 iOS Safari 환경에서만 표시된다.
 * mounted 상태 패턴으로 Hydration 에러를 방지한다.
 * @requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */
export function IosPwaGuide() {
  const [mounted, setMounted] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // localStorage에서 dismiss 상태 복원
    try {
      const stored = localStorage.getItem(IOS_DISMISS_KEY)
      if (stored === 'true') {
        setDismissed(true)
      }
    } catch {
      // 시크릿 모드 등에서 localStorage 접근 실패 시 무시
    }
    setMounted(true)
  }, [])

  // SSR 시점에는 null 반환 → Hydration 불일치 방지
  if (!mounted) return null

  // standalone 모드 시 미표시
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
  if (isStandalone) return null

  // iOS Safari가 아니면 미표시
  if (!isIosSafari()) return null

  // 이미 dismiss한 경우 미표시
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
      className="animate-slide-up fixed inset-x-0 bottom-0 z-[1100] rounded-t-2xl border-t border-border bg-surface px-4 pb-safe-bottom pt-4 shadow-2xl"
      role="dialog"
      aria-label="iOS 앱 설치 안내"
    >
      {/* 드래그 핸들 */}
      <div className="mb-3 flex justify-center">
        <div className="h-1 w-10 rounded-full bg-muted" />
      </div>

      {/* 헤더 */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛂</span>
          <p className="text-sm font-bold text-main-text">
            Not a Trip 홈 화면에 추가하기
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 text-muted transition-colors hover:text-main-text"
          aria-label="안내 닫기"
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

      {/* 단계별 안내 */}
      <div className="mb-4 space-y-3">
        <Step number={1} icon="⎙" text="하단의 공유 버튼을 눌러주세요" />
        <Step number={2} icon="➕" text="'홈 화면에 추가'를 선택해 주세요" />
        <Step number={3} icon="✅" text="'추가'를 눌러 설치를 완료하세요" />
      </div>

      {/* 다시 보지 않기 */}
      <button
        onClick={handleDismiss}
        className="mb-2 w-full py-2 text-center text-xs text-muted transition-colors hover:text-sub-text"
      >
        다시 보지 않기
      </button>
    </div>
  )
}

/** 단계별 안내 아이템 */
function Step({
  number,
  icon,
  text,
}: {
  number: number
  icon: string
  text: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary">
        {number}
      </div>
      <span className="text-lg">{icon}</span>
      <p className="text-sm text-sub-text">{text}</p>
    </div>
  )
}

/**
 * iOS Safari 브라우저 감지
 * User-Agent에 iphone, ipad, ipod 키워드가 포함되어 있는지 확인한다.
 */
export function isIosSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}
