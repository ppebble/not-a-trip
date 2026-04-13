'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { GlobeFallback2D } from '@/components/landing/GlobeFallback2D'
import { GLOBE_CONFIG } from '@/components/landing/Globe3D'
import type { GlobeDataPoint } from '@/components/landing/data/globeData'

const Globe3D = dynamic(
  () =>
    import('@/components/landing/Globe3D').then((mod) => ({
      default: mod.Globe3D,
    })),
  { ssr: false }
)

const SAMPLE_DATA: GlobeDataPoint[] = [
  {
    lat: 35.6995,
    lng: 139.771,
    label: '아키하바라',
    category: 'animation',
    thumbnail: '/icons/categories/animation.webp',
  },
  {
    lat: 41.3809,
    lng: 2.1228,
    label: '캄프 노우',
    category: 'sports',
    thumbnail: '/icons/categories/sports.webp',
  },
]

/** 의도적으로 에러를 발생시키는 컴포넌트 */
function BuggyGlobeChild() {
  throw new Error('WebGL 렌더링 에러 시뮬레이션!')
  return null
}

export default function GlobeFallbackTestPage() {
  const [showBuggy, setShowBuggy] = useState(false)
  const [key, setKey] = useState(0)

  return (
    <div className="min-h-screen bg-neutral-900 px-4 pb-20 pt-20">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="text-xl font-bold text-white">🧪 Globe3D 폴백 테스트</h1>

        {/* GLOBE_CONFIG 확인 */}
        <section className="rounded-lg border border-neutral-700 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">
            📋 GLOBE_CONFIG 설정 객체
          </h2>
          <pre className="rounded bg-neutral-800 p-3 text-xs text-green-300">
            {JSON.stringify(GLOBE_CONFIG, null, 2)}
          </pre>
        </section>

        {/* GlobeFallback2D 단독 렌더링 */}
        <section className="rounded-lg border border-neutral-700 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">
            🌍 GlobeFallback2D (2D 폴백 — 단독 렌더링)
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            ErrorBoundary가 에러를 감지했을 때 표시되는 2D 폴백 UI
          </p>
          <div className="flex justify-center rounded-lg bg-neutral-800 p-6">
            <GlobeFallback2D className="h-64 w-64" />
          </div>
        </section>

        {/* Globe3D 정상 렌더링 */}
        <section className="rounded-lg border border-neutral-700 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">
            🌐 Globe3D (정상 렌더링)
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            WebGL이 정상 동작할 때의 3D 지구본
          </p>
          <div className="h-80 rounded-lg bg-neutral-800">
            <Globe3D dataPoints={SAMPLE_DATA} className="h-full w-full" />
          </div>
        </section>

        {/* ErrorBoundary 폴백 시뮬레이션 */}
        <section className="rounded-lg border border-neutral-700 p-4">
          <h2 className="mb-3 text-sm font-semibold text-neutral-300">
            💥 ErrorBoundary 폴백 시뮬레이션
          </h2>
          <p className="mb-3 text-xs text-neutral-500">
            에러 발생 시 null 대신 GlobeFallback2D가 표시되는지 확인
          </p>
          <div className="mb-3 flex gap-3">
            <button
              onClick={() => {
                setShowBuggy(true)
                setKey((k) => k + 1)
              }}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
            >
              💥 에러 발생시키기
            </button>
            <button
              onClick={() => {
                setShowBuggy(false)
                setKey((k) => k + 1)
              }}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              🔄 정상 상태로 복구
            </button>
          </div>
          <div className="h-80 rounded-lg bg-neutral-800" key={key}>
            {showBuggy ? (
              <Globe3D dataPoints={[]} className="h-full w-full" />
            ) : (
              <Globe3D dataPoints={SAMPLE_DATA} className="h-full w-full" />
            )}
          </div>
          {showBuggy && (
            <p className="mt-2 text-xs text-yellow-400">
              ⚠️ Globe3D 내부 ErrorBoundary가 에러를 감지하면 GlobeFallback2D가
              표시됩니다. (Canvas 내부 에러만 감지 — 빈 데이터는 에러가 아님)
            </p>
          )}
        </section>

        <p className="text-xs text-neutral-500">
          💡 실제 WebGL 에러는 브라우저의 WebGL을 비활성화하거나, 개발자
          도구에서 Canvas context를 null로 오버라이드하여 테스트할 수 있습니다.
        </p>
      </div>
    </div>
  )
}
