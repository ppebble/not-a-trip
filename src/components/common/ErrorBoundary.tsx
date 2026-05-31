'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'
import { AlertTriangleIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  renderFallback?: (props: {
    error: Error
    reset: () => void
  }) => React.ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

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
      if (this.props.renderFallback) {
        return this.props.renderFallback({
          error: this.state.error,
          reset: this.handleReset,
        })
      }

      if (this.props.fallback) {
        return this.props.fallback
      }

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

    return this.props.children
  }
}

export { ErrorBoundary }
export type { ErrorBoundaryProps }
