'use client'

import { useEffect, useState } from 'react'

/**
 * prefers-reduced-motion 미디어 쿼리 감지 훅
 *
 * OS/브라우저의 모션 감소 설정을 실시간으로 감지한다.
 * matchMedia 변경 이벤트 리스너로 설정 변경 시 즉시 반영.
 * SSR 시 false를 반환하여 Hydration Mismatch 방지.
 *
 * Requirements: 7.6
 */

const QUERY = '(prefers-reduced-motion: reduce)'

export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY)
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
