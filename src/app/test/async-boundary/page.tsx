'use client'

import { useState } from 'react'
import { AsyncBoundary } from '@/components/common'
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

/** 지연 후 성공하는 fetch를 시뮬레이션 */
function SuccessContent() {
  const { data } = useSuspenseQuery({
    queryKey: ['test', 'success'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 2000))
      return { message: '데이터 로딩 성공!' }
    },
  })

  return (
    <div className="rounded-lg bg-green-900/30 p-4">
      <p className="text-green-300">✅ {data.message}</p>
    </div>
  )
}

/** 항상 실패하는 fetch를 시뮬레이션 */
function FailContent() {
  useSuspenseQuery({
    queryKey: ['test', 'fail', Date.now()],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 500))
      throw new Error('API 요청 실패: 서버 응답 없음')
    },
  })

  return null
}

function TestContent() {
  const [showFail, setShowFail] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">
        🧪 AsyncBoundary 테스트
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        SSR 방어 + Suspense + ErrorBoundary 조합 동작을 확인하세요.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        {/* 성공 케이스 */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            1. 로딩 → 성공
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            2초 후 데이터 로딩 성공 (pendingFallback → 콘텐츠)
          </p>
          <AsyncBoundary
            pendingFallback={
              <div className="animate-pulse rounded-lg bg-slate-700 p-4">
                <div className="h-4 w-3/4 rounded bg-slate-600" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-600" />
              </div>
            }
          >
            <SuccessContent />
          </AsyncBoundary>
        </section>

        {/* 실패 케이스 */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            2. 로딩 → 에러 → 재시도
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            항상 실패하는 쿼리 (ErrorBoundary + 재시도 버튼)
          </p>
          <button
            onClick={() => setShowFail(true)}
            className="mb-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
          >
            실패 쿼리 마운트
          </button>
          {showFail && (
            <AsyncBoundary
              pendingFallback={
                <div className="animate-pulse rounded-lg bg-slate-700 p-4">
                  <div className="h-4 w-3/4 rounded bg-slate-600" />
                </div>
              }
              rejectedFallback={({ error, reset }) => (
                <div className="rounded-lg bg-red-900/30 p-4 text-center">
                  <p className="text-red-300">💥 에러 포착</p>
                  <p className="mt-1 text-xs text-red-400">{error.message}</p>
                  <button
                    onClick={reset}
                    className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                  >
                    다시 시도
                  </button>
                </div>
              )}
            >
              <FailContent />
            </AsyncBoundary>
          )}
        </section>
      </div>
    </div>
  )
}

export default function AsyncBoundaryTestPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <TestContent />
    </QueryClientProvider>
  )
}
