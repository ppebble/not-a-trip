'use client'

import { useState, useEffect } from 'react'

const DISMISS_KEY = 'not-a-trip-pwa-prompt-dismissed'

/**
 * iOS Safari에서 PWA 설치를 유도하는 컴포넌트
 * - iOS Safari 감지
 * - 수동 설치 방법 안내
 * - localStorage로 "다시 보지 않기" 상태 저장
 *
 * @requirements 4.1
 */
export function IosPwaPrompt() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isIos = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    const isInStandaloneMode =
      'standalone' in window.navigator &&
      (window.navigator as unknown as { standalone: boolean }).standalone
    const isDismissed = localStorage.getItem(DISMISS_KEY) === 'true'

    if (isIos && !isInStandaloneMode && !isDismissed) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe-bottom">
      <div className="mx-4 mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              홈 화면에 추가하기
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Safari 하단의{' '}
              <span className="inline-block text-blue-500">⎙</span> 공유 버튼을
              탭한 후 &quot;홈 화면에 추가&quot;를 선택하세요.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-3 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
