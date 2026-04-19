'use client'

import { useState, useCallback, useEffect } from 'react'
import { executeShare } from '@/lib/share-utils'

interface ShareButtonProps {
  /** 공유 제목 */
  title: string
  /** 공유 텍스트 */
  text: string
  /** 공유 URL (기본: 현재 페이지 URL) */
  url?: string
  /** 버튼 스타일 변형 */
  variant?: 'icon' | 'button'
  /** 추가 className */
  className?: string
}

/**
 * ShareButton 공통 컴포넌트
 * Web Share API 지원 시 네이티브 공유 시트 호출,
 * 미지원 시 클립보드 복사 + 토스트 표시
 *
 * @requirements 2.3, 2.4, 2.5
 */
export default function ShareButton({
  title,
  text,
  url,
  variant = 'icon',
  className = '',
}: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 3000)
    return () => clearTimeout(timer)
  }, [showToast])

  const handleShare = useCallback(async () => {
    const shareUrl =
      url || (typeof window !== 'undefined' ? window.location.href : '')
    const result = await executeShare({ title, text, url: shareUrl })
    if (result === 'copied') {
      setShowToast(true)
    }
  }, [title, text, url])

  return (
    <div className="relative">
      {variant === 'icon' ? (
        <button
          onClick={handleShare}
          className={`flex items-center justify-center rounded-full p-2 text-muted transition-colors hover:bg-surface hover:text-primary ${className}`}
          aria-label="공유하기"
        >
          <ShareIcon />
        </button>
      ) : (
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 active:bg-primary-800 ${className}`}
          aria-label="공유하기"
        >
          <ShareIcon />
          공유
        </button>
      )}

      {showToast && (
        <div
          className="animate-fade-in fixed bottom-20 left-1/2 z-[9999] -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg dark:bg-gray-700"
          role="status"
          aria-live="polite"
        >
          링크가 복사되었습니다
        </div>
      )}
    </div>
  )
}

function ShareIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
      />
    </svg>
  )
}
