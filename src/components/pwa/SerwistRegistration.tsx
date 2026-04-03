'use client'

import { useEffect } from 'react'

/**
 * Serwist Service Worker 등록 컴포넌트
 * 클라이언트 사이드에서 SW를 자동 등록합니다.
 * @requirements 1.4, 1.6
 */
export function SerwistRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker 등록 실패:', error)
      })
    }
  }, [])

  return null
}
