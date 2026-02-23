'use client'

import { useEffect } from 'react'

/**
 * Service Worker 등록 컴포넌트
 * 클라이언트 사이드에서 SW를 등록합니다.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service Worker 등록 실패:', error)
      })
    }
  }, [])

  return null
}
