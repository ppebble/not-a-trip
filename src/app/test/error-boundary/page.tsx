'use client'

import { useState } from 'react'
import { ErrorBoundary } from '@/components/common'

/** 버튼 클릭 시 에러를 throw하는 컴포넌트 */
function BuggyCounter({ label }: { label: string }) {
  const [count, setCount] = useState(0)

  if (count >= 3) {
    throw new Error(`${label}: 카운트가 3 이상이 되어 에러 발생!`)
  }

  return (
    <div className="rounded-lg bg-slate-700 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{count}</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
      >
        +1 (3이면 에러)
      </button>
    </div>
  )
}

/** 즉시 에러를 throw하는 컴포넌트 */
function AlwaysError(): React.ReactNode {
  throw new Error('이 컴포넌트는 항상 에러를 발생시킵니다')
}

export default function ErrorBoundaryTestPage() {
  const [showAlwaysError, setShowAlwaysError] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="mb-2 text-2xl font-bold text-white">
        🧪 ErrorBoundary 테스트
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        카운터를 3까지 올리면 에러가 발생합니다. 각 모드별 동작을 확인하세요.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* 모드 1: 기본 에러 UI */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            1. 기본 에러 UI
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            fallback 없이 기본 제공 UI 사용
          </p>
          <div className="min-h-[200px]">
            <ErrorBoundary>
              <BuggyCounter label="기본 모드" />
            </ErrorBoundary>
          </div>
        </section>

        {/* 모드 2: fallback (ReactNode) */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            2. fallback (ReactNode)
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            정적 ReactNode를 fallback으로 전달
          </p>
          <div className="min-h-[200px]">
            <ErrorBoundary
              fallback={
                <div className="rounded-lg bg-orange-900/30 p-4 text-center">
                  <p className="text-orange-300">
                    🔥 커스텀 fallback ReactNode
                  </p>
                  <p className="mt-1 text-xs text-orange-400">
                    정적 UI이므로 에러 정보나 리셋 버튼 없음
                  </p>
                </div>
              }
            >
              <BuggyCounter label="fallback 모드" />
            </ErrorBoundary>
          </div>
        </section>

        {/* 모드 3: renderFallback (Render Props) */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            3. renderFallback (Render Props)
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            에러 정보 + reset 함수를 받는 커스텀 UI
          </p>
          <div className="min-h-[200px]">
            <ErrorBoundary
              renderFallback={({ error, reset }) => (
                <div className="rounded-lg bg-purple-900/30 p-4 text-center">
                  <p className="text-purple-300">💜 renderFallback 커스텀 UI</p>
                  <p className="mt-1 text-xs text-purple-400">
                    {error.message}
                  </p>
                  <button
                    onClick={reset}
                    className="mt-3 rounded bg-purple-600 px-3 py-1 text-sm text-white hover:bg-purple-500"
                  >
                    리셋하기
                  </button>
                </div>
              )}
            >
              <BuggyCounter label="renderFallback 모드" />
            </ErrorBoundary>
          </div>
        </section>

        {/* 모드 4: onReset 콜백 */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            4. onReset 콜백
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            리셋 시 외부 상태도 함께 초기화
          </p>
          <div className="min-h-[200px]">
            <ErrorBoundary
              key={resetKey}
              onReset={() => setResetKey((k) => k + 1)}
              renderFallback={({ error, reset }) => (
                <div className="rounded-lg bg-green-900/30 p-4 text-center">
                  <p className="text-green-300">🔄 onReset 콜백 테스트</p>
                  <p className="mt-1 text-xs text-green-400">{error.message}</p>
                  <button
                    onClick={reset}
                    className="mt-3 rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-500"
                  >
                    리셋 (key 갱신: {resetKey})
                  </button>
                </div>
              )}
            >
              <BuggyCounter label="onReset 모드" />
            </ErrorBoundary>
          </div>
        </section>

        {/* 모드 5: 투명성 (에러 없는 경우) */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            5. 투명성 테스트
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            에러 없으면 자식을 그대로 렌더링
          </p>
          <div className="min-h-[200px]">
            <ErrorBoundary>
              <div className="rounded-lg bg-slate-700 p-4">
                <p className="text-green-400">✅ 에러 없음 — 정상 렌더링</p>
                <p className="mt-1 text-sm text-slate-300">
                  ErrorBoundary가 자식을 변경 없이 통과시킵니다
                </p>
              </div>
            </ErrorBoundary>
          </div>
        </section>

        {/* 모드 6: 즉시 에러 토글 */}
        <section className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">
            6. 즉시 에러 컴포넌트
          </h2>
          <p className="mb-4 text-xs text-slate-400">
            마운트 즉시 에러를 throw
          </p>
          <div className="min-h-[200px]">
            <button
              onClick={() => setShowAlwaysError(true)}
              className="mb-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
            >
              에러 컴포넌트 마운트
            </button>
            {showAlwaysError && (
              <ErrorBoundary
                renderFallback={({ error, reset }) => (
                  <div className="rounded-lg bg-red-900/30 p-4 text-center">
                    <p className="text-red-300">💥 즉시 에러 포착</p>
                    <p className="mt-1 text-xs text-red-400">{error.message}</p>
                    <button
                      onClick={() => {
                        setShowAlwaysError(false)
                        reset()
                      }}
                      className="mt-3 rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-500"
                    >
                      닫기
                    </button>
                  </div>
                )}
              >
                <AlwaysError />
              </ErrorBoundary>
            )}
          </div>
        </section>
      </div>

      {/* 상태 패널 */}
      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-800 p-4">
        <h3 className="text-sm font-semibold text-slate-300">현재 상태</h3>
        <div className="mt-2 flex gap-4 text-xs text-slate-400">
          <span>resetKey: {resetKey}</span>
          <span>showAlwaysError: {showAlwaysError ? 'true' : 'false'}</span>
        </div>
      </div>
    </div>
  )
}
