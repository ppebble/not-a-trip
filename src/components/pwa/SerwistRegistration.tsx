'use client'

import { useEffect } from 'react'

const DEV_SW_RESET_KEY = 'not-a-trip-dev-sw-reset'

async function resetDevelopmentServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations()

  if (registrations.length === 0) {
    sessionStorage.removeItem(DEV_SW_RESET_KEY)
    return
  }

  await Promise.all(
    registrations.map((registration) => registration.unregister())
  )

  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
  }

  if (
    navigator.serviceWorker.controller &&
    sessionStorage.getItem(DEV_SW_RESET_KEY) !== 'done'
  ) {
    sessionStorage.setItem(DEV_SW_RESET_KEY, 'done')
    window.location.reload()
    return
  }

  sessionStorage.removeItem(DEV_SW_RESET_KEY)
}

/**
 * Serwist Service Worker 등록 컴포넌트
 * - production: service worker 등록
 * - development: stale service worker 등록 해제 + cache 정리
 * @requirements 1.4, 1.6
 */
export function SerwistRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    if (process.env.NODE_ENV !== 'production') {
      resetDevelopmentServiceWorkers().catch(() => undefined)
      return
    }

    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }, [])

  return null
}
