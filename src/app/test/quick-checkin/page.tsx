'use client'

import { useState } from 'react'
import { QuickCheckIn } from '@/components/checkin'
import { ViewfinderOverlay } from '@/components/mobile/ViewfinderOverlay'

/**
 * 빠른 인증 플로우 테스트 페이지
 * Task 14 체크포인트 확인용
 */
export default function QuickCheckInTestPage() {
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false)
  const [showViewfinder, setShowViewfinder] = useState(false)
  const [lastAction, setLastAction] = useState<string>('대기 중')

  const testSceneImage = '/uploads/1768301458149-cn502o.jpg'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="mb-6 text-2xl font-bold">🧪 빠른 인증 플로우 테스트</h1>

      {/* 상태 패널 */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold">현재 상태</h2>
        <p className="text-sm text-gray-600">{lastAction}</p>
      </div>

      {/* 테스트 버튼들 */}
      <div className="space-y-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-3 font-semibold">QuickCheckIn 컴포넌트</h3>
          <p className="mb-3 text-sm text-gray-500">
            3단계 플로우: 사진 선택 → 코멘트 → 완료
          </p>
          <button
            onClick={() => {
              setShowQuickCheckIn(true)
              setLastAction('QuickCheckIn 열림')
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            QuickCheckIn 열기
          </button>
        </div>

        <div className="rounded-lg bg-white p-4 shadow">
          <h3 className="mb-3 font-semibold">ViewfinderOverlay 컴포넌트</h3>
          <p className="mb-3 text-sm text-gray-500">
            카메라 + 씬 이미지 오버레이 (30~50% 투명도)
          </p>
          <button
            onClick={() => {
              setShowViewfinder(true)
              setLastAction('ViewfinderOverlay 열림')
            }}
            className="rounded-lg bg-green-600 px-4 py-2 text-white"
          >
            뷰파인더 열기
          </button>
        </div>
      </div>

      {/* QuickCheckIn 모달 */}
      {showQuickCheckIn && (
        <QuickCheckIn
          spotId="test-spot-001"
          spotName="테스트 스팟"
          sceneImageUrl={testSceneImage}
          onClose={() => {
            setShowQuickCheckIn(false)
            setLastAction('QuickCheckIn 닫힘')
          }}
          onSuccess={() => setLastAction('인증 성공!')}
        />
      )}

      {/* ViewfinderOverlay */}
      {showViewfinder && (
        <ViewfinderOverlay
          sceneImageUrl={testSceneImage}
          onCapture={(blob) => {
            setShowViewfinder(false)
            setLastAction(`촬영 완료 (${(blob.size / 1024).toFixed(1)}KB)`)
          }}
          onClose={() => {
            setShowViewfinder(false)
            setLastAction('뷰파인더 닫힘')
          }}
        />
      )}
    </div>
  )
}
