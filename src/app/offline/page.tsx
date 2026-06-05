'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/**
 * 오프라인 폴백 페이지
 * Service Worker가 네비게이션 요청 실패 시 이 페이지로 폴백한다.
 * 네트워크 복구를 자동 감지하여 새로고침을 유도한다.
 * @requirements 4.1, 4.2, 4.3, 4.4, 4.6, 4.7
 */
export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false)

  useEffect(() => {
    // 현재 온라인 상태 확인
    if (navigator.onLine) {
      setIsOnline(true)
    }

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-background px-4">
      <div className="flex max-w-sm flex-col items-center text-center">
        {/* 마스코트 일러스트 */}
        <Image
          src="/icons/mascot/mascot-profile-front-full.webp"
          alt="Not a Trip 마스코트"
          width={180}
          height={180}
          className="mb-6"
          priority
        />

        {/* 안내 문구 */}
        <h1 className="mb-2 text-xl font-bold text-main-text">
          네트워크가 연결되지 않았습니다
        </h1>
        <p className="mb-8 text-sm text-sub-text">
          인터넷 연결을 확인한 후 다시 시도해 주세요
        </p>

        {/* 네트워크 복구 감지 시 안내 */}
        {isOnline && (
          <div className="mb-4 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
            네트워크가 복구되었습니다. 새로고침해 주세요!
          </div>
        )}

        {/* 다시 시도 버튼 */}
        <button
          onClick={handleRetry}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-600 active:scale-95"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
