'use client'

import { useState, useCallback, useRef } from 'react'

interface UseToastReturn {
  toast: { message: string; isVisible: boolean } | null
  showToast: (message: string, duration?: number) => void
  hideToast: () => void
}

/**
 * useToast 훅
 *
 * 토스트 메시지 표시/숨김 상태를 관리한다.
 * 기본 3초 후 자동 사라짐.
 *
 * @requirements 2.5
 */
export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<{
    message: string
    isVisible: boolean
  } | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hideToast = useCallback(() => {
    setToast((prev) => (prev ? { ...prev, isVisible: false } : null))
    // 애니메이션 완료 후 완전히 제거
    setTimeout(() => setToast(null), 300)
  }, [])

  const showToast = useCallback(
    (message: string, duration = 3000) => {
      // 기존 타이머 정리
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      setToast({ message, isVisible: true })

      timerRef.current = setTimeout(() => {
        hideToast()
        timerRef.current = null
      }, duration)
    },
    [hideToast]
  )

  return { toast, showToast, hideToast }
}
