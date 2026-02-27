'use client'

import { useState } from 'react'
import { StatusReportForm } from '@/components/report/StatusReportForm'
import { SpotStatusIndicator } from '@/components/report/SpotStatusIndicator'
import type { SpotStatus } from '@/types/report'

const STATUSES: SpotStatus[] = [
  'normal',
  'partially_changed',
  'under_construction',
  'demolished',
  'inaccessible',
]

/**
 * 🧪 상태 신고 UI 테스트 페이지
 */
export default function StatusReportTestPage() {
  const [selectedStatus, setSelectedStatus] = useState<SpotStatus>('normal')

  return (
    <div className="mx-auto max-w-lg space-y-8 p-4">
      <h1 className="text-xl font-bold text-navy-800">
        🧪 상태 신고 UI 테스트
      </h1>

      {/* SpotStatusIndicator 테스트 */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">
          SpotStatusIndicator
        </h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setSelectedStatus(s)}>
              <SpotStatusIndicator
                status={s}
                size={selectedStatus === s ? 'md' : 'sm'}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-navy-400">선택된 상태: {selectedStatus}</p>
        <div className="text-xs text-navy-400">
          status 없을 때: <SpotStatusIndicator status={undefined} />
          (아무것도 안 보여야 함)
        </div>
      </section>

      {/* StatusReportForm 테스트 */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">
          StatusReportForm (mock spotId)
        </h2>
        <div className="rounded-lg border border-navy-100 p-4">
          <StatusReportForm
            spotId="test-spot-id"
            onSuccess={() => alert('성공!')}
            onCancel={() => alert('취소!')}
          />
        </div>
      </section>
    </div>
  )
}
