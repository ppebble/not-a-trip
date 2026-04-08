'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useMyReports } from '@/hooks/useMyReports'
import { ReportStatusBadge } from './ReportStatusBadge'
import { CATEGORY_CONFIG } from '@/types/spot'
import type { SpotReport } from '@/types/report'

/**
 * 내 제보 목록 컴포넌트
 * Requirements: 1.6, 2.2
 */
export function MyReportList() {
  const [page, setPage] = useState(1)
  const { data, isLoading, error } = useMyReports(page)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        제보 목록을 불러오는데 실패했습니다
      </div>
    )
  }

  if (!data || data.reports.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg">📝</p>
        <p className="mt-2 text-sm text-muted">아직 제보한 성지가 없습니다</p>
        <Link
          href="/reports/new"
          className="mt-3 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          성지 제보하기
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-3">
        {data.reports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>

      {/* 페이지네이션 */}
      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md px-3 py-1 text-sm text-primary hover:bg-surface disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-sm text-secondary">
            {page} / {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="rounded-md px-3 py-1 text-sm text-primary hover:bg-surface disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}

function ReportCard({ report }: { report: SpotReport }) {
  const categoryConfig = report.category
    ? CATEGORY_CONFIG[report.category]
    : null
  const thumbnail = report.evidencePairs[0]?.realPhotoUrl

  return (
    <Link
      href={`/reports/${report.id}`}
      className="flex gap-3 rounded-lg border border-border bg-white p-3 transition-colors hover:bg-surface/50 dark:bg-neutral-800"
    >
      {/* 썸네일 */}
      {thumbnail ? (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
          <Image
            src={thumbnail}
            alt={report.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-surface text-2xl">
          📍
        </div>
      )}

      {/* 정보 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-medium text-primary-800">
            {report.name}
          </p>
          <ReportStatusBadge status={report.status} />
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">{report.address}</p>
        <div className="mt-1 flex items-center gap-2">
          {categoryConfig && (
            <span className="text-xs text-muted">{categoryConfig.label}</span>
          )}
          <span className="text-xs text-neutral-300">
            {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </span>
        </div>
        {/* 수정요청 시 관리자 코멘트 표시 */}
        {report.status === 'revision_requested' && report.reviewComment && (
          <p className="mt-1 truncate text-xs text-primary">
            💬 {report.reviewComment}
          </p>
        )}
      </div>
    </Link>
  )
}
