'use client'

import { useState } from 'react'
import { useAdminSupplements } from '@/hooks/useAdminQueries'
import { SupplementSummaryCard } from './SupplementSummaryCard'
import type { SpotSupplement } from '@/types/report'

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: '대기중' },
  { value: 'all', label: '전체' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
]

interface AdminSupplementListProps {
  onSelectSupplement: (supplement: SpotSupplement) => void
  selectedSupplementId?: string
}

/**
 * 관리자 정보 보완 목록 컴포넌트
 * Requirements: 3.1, 3.3, 8.3
 */
export function AdminSupplementList({
  onSelectSupplement,
  selectedSupplementId,
}: AdminSupplementListProps) {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useAdminSupplements(statusFilter, page)

  const supplements = data?.supplements ?? []
  const totalPages = data?.totalPages ?? 1
  const total = data?.total ?? 0

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {error instanceof Error ? error.message : '오류가 발생했습니다'}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* 상태 필터 */}
      <div className="border-b border-gray-200 p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-navy-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">총 {total}건</p>
      </div>

      {/* 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-2 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-lg bg-gray-100"
              />
            ))}
          </div>
        ) : supplements.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            {statusFilter === 'pending'
              ? '대기중인 정보 보완이 없습니다'
              : '해당 상태의 정보 보완이 없습니다'}
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {supplements.map((supplement) => (
              <SupplementSummaryCard
                key={supplement.id}
                supplement={supplement}
                isSelected={selectedSupplementId === supplement.id}
                onClick={() => onSelectSupplement(supplement)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-gray-200 p-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            이전
          </button>
          <span className="text-xs text-gray-500">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-30"
          >
            다음
          </button>
        </div>
      )}
    </div>
  )
}
