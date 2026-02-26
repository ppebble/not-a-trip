'use client'

import { useState } from 'react'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import type { ReportStatus } from '@/types/report'
import Link from 'next/link'

const STATUSES: ReportStatus[] = [
  'pending',
  'approved',
  'rejected',
  'revision_requested',
]

/**
 * 🧪 제보 페이지 테스트
 * 실제 페이지 링크 + 상태 뱃지 확인용
 */
export default function ReportUITestPage() {
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>('pending')

  return (
    <div className="mx-auto max-w-lg space-y-8 p-4">
      <h1 className="text-xl font-bold text-navy-800">🧪 제보 페이지 테스트</h1>

      {/* 페이지 링크 */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">페이지 이동</h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/reports/new"
            className="rounded-lg bg-navy-600 px-4 py-2 text-center text-sm text-white hover:bg-navy-700"
          >
            새 성지 제보 →
          </Link>
          <Link
            href="/reports"
            className="rounded-lg border border-navy-300 px-4 py-2 text-center text-sm text-navy-600 hover:bg-navy-50"
          >
            내 제보 목록 →
          </Link>
        </div>
      </section>

      {/* ReportStatusBadge */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-navy-600">상태 뱃지</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setSelectedStatus(s)}>
              <ReportStatusBadge
                status={s}
                size={selectedStatus === s ? 'md' : 'sm'}
              />
            </button>
          ))}
        </div>
        <p className="text-xs text-navy-400">선택된 상태: {selectedStatus}</p>
      </section>
    </div>
  )
}
