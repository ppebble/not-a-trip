'use client'

import { Suspense } from 'react'
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from './ErrorBoundary'
import { useIsMounted } from '@/hooks/useIsMounted'

interface AsyncBoundaryProps {
  children: React.ReactNode
  /** 로딩 중 표시할 UI (Suspense fallback + SSR 마운트 전 fallback) */
  pendingFallback: React.ReactNode
  /** 에러 발생 시 표시할 UI (Render Props 패턴) */
  rejectedFallback?: (props: {
    error: Error
    reset: () => void
  }) => React.ReactNode
}

/**
 * QueryErrorResetBoundary + ErrorBoundary + Suspense + useIsMounted 조합 편의 래퍼
 *
 * SSR 환경에서 마운트 전에는 pendingFallback을 표시하고,
 * 마운트 후에만 자식 컴포넌트(useSuspenseQuery 포함)를 렌더링한다.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.6
 */
export function AsyncBoundary({
  children,
  pendingFallback,
  rejectedFallback,
}: AsyncBoundaryProps) {
  const isMounted = useIsMounted()

  if (!isMounted) return <>{pendingFallback}</>

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} renderFallback={rejectedFallback}>
          <Suspense fallback={pendingFallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export type { AsyncBoundaryProps }
