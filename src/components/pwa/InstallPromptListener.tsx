'use client'

import { useEffect } from 'react'
import { usePwaStore } from '@/stores/pwaStore'

/**
 * beforeinstallprompt / appinstalled 이벤트를 감지하여 pwaStore에 연결하는 리스너.
 * standalone 모드 감지도 포함.
 * layout.tsx의 Providers 내부에 주입한다.
 */
export function InstallPromptListener() {
  useEffect(() => {
    const { setDeferredPrompt, setInstalled } = usePwaStore.getState()

    // standalone 모드 감지 (이미 설치된 상태)
    const standaloneQuery = window.matchMedia('(display-mode: standalone)')
    if (standaloneQuery.matches) {
      setInstalled()
    }
    const handleStandaloneChange = (e: MediaQueryListEvent) => {
      if (e.matches) setInstalled()
    }
    standaloneQuery.addEventListener('change', handleStandaloneChange)

    // beforeinstallprompt 이벤트 감지
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // appinstalled 이벤트 감지
    const handleAppInstalled = () => {
      setInstalled()
    }
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      standaloneQuery.removeEventListener('change', handleStandaloneChange)
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return null
}
