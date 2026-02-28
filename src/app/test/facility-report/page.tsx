'use client'

import { useState } from 'react'
import FacilityReportForm from '@/components/spot/FacilityReportForm'

export default function FacilityReportTestPage() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <main className="min-h-screen bg-navy-50 pt-14">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-bold text-navy-900">
          🧪 FacilityReportForm 테스트
        </h1>

        <div className="mb-4 rounded-lg bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-navy-700">
            테스트 안내
          </h2>
          <ul className="space-y-1 text-xs text-navy-500">
            <li>• 모달 열기/닫기 동작 확인</li>
            <li>• 장소 입력 방식 선택 (구글맵 검색 / 직접 핀)</li>
            <li>• 카테고리 선택 시 동적 필드 표시 확인</li>
            <li>• 필수 필드 미입력 시 오류 메시지 확인</li>
            <li>• 제출 처리 및 성공/에러 메시지 확인</li>
          </ul>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-navy-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-navy-700"
        >
          📝 편의시설 제보 모달 열기
        </button>

        <FacilityReportForm
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={() => alert('제보 성공 콜백 호출됨')}
          spotCoordinates={{ lat: 35.6984, lng: 139.7731 }}
        />
      </div>
    </main>
  )
}
