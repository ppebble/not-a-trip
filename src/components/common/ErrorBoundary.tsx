'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangleIcon } from '@/components/icons'

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
        <div className="flex h-full w-full items-center justify-center p-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
              <AlertTriangleIcon size={24} color="#dc2626" />
            </div>
            <p className="mt-4 text-sm text-gray-700">문제가 발생했습니다</p>
            <p className="mt-1 text-xs text-gray-500">
              {this.state.error.message}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-3 rounded bg-navy-600 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-500"
            >
              다시 시도
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
