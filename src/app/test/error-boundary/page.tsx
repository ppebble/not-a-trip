'use client'

import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'

function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('테스트용 렌더링 에러 발생!')
  }
  return (
    <div className="rounded-lg bg-green-900/30 p-4 text-green-300">
      ✅ 정상 렌더링 중
    </div>
  )
}

export default function ErrorBoundaryTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false)
  const [key, setKey] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 px-4 pb-20 pt-20">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-xl font-bold text-white">
          🧪 ErrorBoundary + Sentry 테스트
        </h1>

        <div className="space-y-3">
          <button
            onClick={() => {
              setShouldThrow(true)
              setKey((k) => k + 1)
            }}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
          >
            💥 에러 발생시키기
          </button>
          <button
            onClick={() => {
              setShouldThrow(false)
              setKey((k) => k + 1)
            }}
            className="ml-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            🔄 정상 상태로 복구
          </button>
        </div>

        <div className="rounded-lg border border-slate-700 p-4">
          <p className="mb-3 text-sm text-slate-400">
            ErrorBoundary 영역 (콘솔에서 Sentry 보고 확인)
          </p>
          <ErrorBoundary
            key={key}
            onReset={() => {
              setShouldThrow(false)
              setKey((k) => k + 1)
            }}
          >
            <BuggyComponent shouldThrow={shouldThrow} />
          </ErrorBoundary>
        </div>

        <p className="text-xs text-slate-500">
          에러 발생 시 브라우저 콘솔에서 [ErrorBoundary] 로그와 Sentry
          captureException 호출을 확인할 수 있습니다.
        </p>

        <div className="rounded-lg bg-slate-800 p-3 text-xs text-slate-400">
          <p>
            Sentry 초기화: {Sentry.isInitialized() ? '✅ 활성' : '❌ 비활성'}
          </p>
          <p>
            DSN:{' '}
            {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅ 설정됨' : '❌ 미설정'}
          </p>
          <p>NODE_ENV: {process.env.NODE_ENV}</p>
          <button
            onClick={() => {
              Sentry.captureException(new Error('수동 Sentry 테스트 에러'))
              alert('Sentry.captureException 호출 완료. 대시보드를 확인하세요.')
            }}
            className="mt-2 rounded bg-yellow-600 px-3 py-1 text-white hover:bg-yellow-500"
          >
            🔔 수동 Sentry 에러 전송
          </button>
        </div>
      </div>
    </div>
  )
}
