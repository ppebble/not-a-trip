'use client'

/**
 * LocationButton & GpsErrorFallback 테스트 페이지
 * 현재 위치 버튼과 GPS 에러 폴백 UI를 테스트합니다.
 */

import { useState } from 'react'
import LocationButton from '@/components/mobile/LocationButton'
import GpsErrorFallback from '@/components/mobile/GpsErrorFallback'

export default function LocationButtonTestPage() {
  const [log, setLog] = useState<string[]>([])
  const [mockError, setMockError] = useState<{
    code: string
    message: string
  } | null>(null)
  const [gpsError, setGpsError] = useState<{
    code: string
    message: string
  } | null>(null)

  const addLog = (msg: string) => {
    setLog((prev) =>
      [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 20)
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="mb-4 text-xl font-bold text-navy-800">
        LocationButton & GpsErrorFallback 테스트
      </h1>

      {/* 실제 GPS 테스트 */}
      <div className="relative mb-4 flex h-64 items-center justify-center rounded-lg bg-navy-100">
        <p className="text-sm text-navy-500">지도 영역 (mock)</p>
        <LocationButton
          onLocationFound={(lat, lng) => {
            addLog(`위치 획득: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
            setGpsError(null)
          }}
          onError={(error) => {
            addLog(`에러: [${error.code}] ${error.message}`)
            setGpsError(error)
          }}
          className="absolute bottom-4 right-4"
        />
        {gpsError && (
          <GpsErrorFallback
            error={gpsError}
            onDismiss={() => setGpsError(null)}
          />
        )}
      </div>

      {/* Mock 에러 테스트 */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-navy-700">에러 유형별 테스트</h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { code: 'PERMISSION_DENIED', label: '권한 거부' },
            { code: 'POSITION_UNAVAILABLE', label: 'GPS 불가' },
            { code: 'TIMEOUT', label: '타임아웃' },
            { code: 'UNKNOWN', label: '알 수 없음' },
          ].map(({ code, label }) => (
            <button
              key={code}
              onClick={() =>
                setMockError({
                  code,
                  message: `테스트: ${label} 에러`,
                })
              }
              className="rounded-lg bg-red-100 px-3 py-2 text-sm text-red-700"
            >
              {label}
            </button>
          ))}
        </div>
        {mockError && (
          <div className="relative mt-3">
            <GpsErrorFallback
              error={mockError}
              onDismiss={() => setMockError(null)}
            />
          </div>
        )}
      </div>

      {/* 로그 */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-navy-700">로그</h2>
        <div className="max-h-40 overflow-y-auto font-mono text-xs text-navy-600">
          {log.length === 0 ? (
            <p className="text-navy-400">버튼을 눌러 테스트하세요</p>
          ) : (
            log.map((entry, i) => <p key={i}>{entry}</p>)
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
        <p>모바일 뷰포트에서 테스트하세요 (DevTools → 모바일 에뮬레이션)</p>
      </div>
    </div>
  )
}
