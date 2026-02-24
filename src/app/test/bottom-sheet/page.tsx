'use client'

/**
 * Bottom Sheet 테스트 페이지
 * 다양한 상태에서 Bottom Sheet 동작을 확인할 수 있습니다.
 */

import { useBottomSheetStore } from '@/stores/bottomSheetStore'
import BottomSheet from '@/components/mobile/BottomSheet'

const MOCK_SPOT_IDS = [
  '6839e0e3e4b0c1a2d3f4e5a6', // 실제 DB에 있는 스팟 ID로 교체 필요
]

export default function BottomSheetTestPage() {
  const { isOpen, heightState, spotId, open, close, expandUp, collapseDown } =
    useBottomSheetStore()

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="mb-4 text-xl font-bold text-navy-800">
        Bottom Sheet 테스트
      </h1>

      {/* 현재 상태 표시 */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 font-semibold text-navy-700">현재 상태</h2>
        <div className="space-y-1 text-sm">
          <p>
            열림: <span className="font-mono">{String(isOpen)}</span>
          </p>
          <p>
            높이: <span className="font-mono">{heightState}</span>
          </p>
          <p>
            스팟 ID: <span className="font-mono">{spotId || 'null'}</span>
          </p>
        </div>
      </div>

      {/* 컨트롤 버튼 */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => open(MOCK_SPOT_IDS[0])}
          className="rounded-lg bg-navy-600 px-4 py-2 text-sm text-white"
        >
          열기 (mock spot)
        </button>
        <button
          onClick={close}
          className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white"
        >
          닫기
        </button>
        <button
          onClick={expandUp}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm text-white"
        >
          ↑ 확장
        </button>
        <button
          onClick={collapseDown}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white"
        >
          ↓ 축소
        </button>
      </div>

      {/* 안내 */}
      <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
        <p>모바일 뷰포트에서 테스트하세요 (DevTools → 모바일 에뮬레이션)</p>
        <p className="mt-1">
          드래그 핸들을 위/아래로 스와이프하여 높이 전환 테스트
        </p>
      </div>

      {/* Bottom Sheet 렌더링 */}
      <BottomSheet />
    </div>
  )
}
