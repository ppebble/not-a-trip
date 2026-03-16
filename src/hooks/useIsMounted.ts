'use client'

import { useEffect, useState } from 'react'

/**
 * 클라이언트 마운트 여부를 감지하는 훅
 *
 * SSR 환경에서 항상 false를 반환하고,
 * 클라이언트 마운트 완료 후 true를 반환한다.
 * useSuspenseQuery로 인한 하이드레이션 불일치를 방지하기 위해 사용.
 *
 * Requirements: 2.6
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
