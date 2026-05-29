'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangleIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

interface ErrorBoundaryProps {
  children: React.ReactNode
  /** 단순 UI 폴백 (ReactNode) */
  fallback?: React.ReactNode
  /** Render Props 패턴 — 에러 정보와 reset 함수를 받아 커스텀 에러 UI를 렌더링 */
  renderFallback?: (props: {
    error: Error
    reset: () => void
  }) => React.ReactNode
  /** 에러 상태 초기화 시 호출되는 콜백 */
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 공통 ErrorBoundary 컴포넌트
 *
 * 하위 컴포넌트 트리에서 발생한 렌더링 에러를 포착하고 대체 UI를 표시한다.
 * fallback 우선순위: renderFallback > fallback > 기본 에러 UI
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo)

    if (Sentry.isInitialized()) {
      Sentry.captureException(error, {
        contexts: { react: { componentStack: errorInfo.componentStack } },
      })
    }
  }

  handleReset = () => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // 우선순위 1: renderFallback (Render Props)
      if (this.props.renderFallback) {
        return this.props.renderFallback({
          error: this.state.error,
          reset: this.handleReset,
        })
      }

      // 우선순위 2: fallback (ReactNode)
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 우선순위 3: 기본 에러 UI
      return (
        <div className="flex h-full w-full items-center justify-center bg-neutral-100 p-8 dark:bg-background">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-lg">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-danger-surface px-3 py-1 text-xs font-medium text-danger">
              <AlertTriangleIcon size={16} color="currentColor" />
              화면 오류
            </div>

            <MascotIllustration
              variant="confirm"
              size="md"
              className="mx-auto mb-3"
            />

            <p className="text-text text-lg font-semibold">
              문제가 발생했습니다
            </p>

            <p className="mt-2 text-sm text-text-secondary">
              잠시 후 다시 시도하면 대부분 정상적으로 복구됩니다.
            </p>

            <p className="mt-3 rounded-xl bg-accent-surface px-4 py-3 text-xs leading-5 text-muted">
              {this.state.error.message}
            </p>

            <button
              onClick={this.handleReset}
              className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500"
            >
              다시 열기
            </button>
          </div>
        </div>
      )
    }

    // 에러가 없으면 자식을 그대로 렌더링 (투명성)
    return this.props.children
  }
}

export { ErrorBoundary }
export type { ErrorBoundaryProps }
