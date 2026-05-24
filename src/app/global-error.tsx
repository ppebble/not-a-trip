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
            臾몄젣媛 諛쒖깮?덉뒿?덈떎
          </h2>
          <p className="mb-6 text-gray-600">
            ?덉긽移?紐삵븳 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎. ?ㅼ떆 ?쒕룄?댁＜?몄슂.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => reset()}
              className="rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
            >
              ?ㅼ떆 ?쒕룄
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
