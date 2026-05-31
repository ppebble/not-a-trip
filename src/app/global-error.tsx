'use client'

import * as Sentry from '@sentry/nextjs'
import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.withScope((scope) => {
      scope.setTag('surface', 'global-error-boundary')
      scope.setContext('error_context', {
        digest: error.digest ?? null,
        url: typeof window !== 'undefined' ? window.location.href : null,
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : null,
      })
      scope.setUser({ id: 'anonymous' })
      Sentry.captureException(error)
    })
  }, [error])

  return (
    <html lang="ko">
      <body className="font-pretendard flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            문제가 발생했습니다
          </h2>
          <p className="mb-6 text-gray-600">
            예상치 못한 오류가 발생했습니다. 다시 시도해주세요.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              다시 시도
            </button>
            <Link
              href="/"
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-100"
            >
              홈으로 이동
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
