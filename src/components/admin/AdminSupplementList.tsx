'use client'

import { useState, useEffect, useCallback } from 'react'
import type { SpotSupplement } from '@/types/report'

interface AdminSupplementsResponse {
  supplements: SpotSupplement[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: 'pending', label: '대기중' },
  { value: 'all', label: '전체' },
  { value: 'approved', label: '승인' },
  { value: 'rejected', label: '반려' },
]

const SUPPLEMENT_TYPE_LABELS: Record<string, string> = {
  scene_info: '씬 정보',
  description: '설명',
  photo: '사진',
  other: '기타',
}

interface AdminSupplementListProps {
  onSelectSupplement: (supplement: SpotSupplement) => void
  selectedSupplementId?: string
  refreshKey?: number
}

/**
 * 관리자 정보 보완 목록 컴포넌트
 * Requirements: 3.1, 3.3
 * - status별 필터 (대기중/승인/반려/전체)
 * - 페이지네이션 (page, limit)
 * - 보완 유형, 기여자명, 대상 스팟명, 상태 배지 표시
 */
export function AdminSupplementList({
  onSelectSupplement,
  selectedSupplementId,
  refreshKey = 0,
}: AdminSupplementListProps) {
  const [supplements, setSupplements] = useState<SpotSupplement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchSupplements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: '20',
      })

      const res = await fetch(`/api/admin/supplements?${params}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '정보 보완 목록 조회 실패')
      }

      const data: AdminSupplementsResponse = await res.json()
      setSupplements(data.supplements)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchSupplements()
  }, [fetchSupplements, refreshKey])

  const handleFilterChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-center text-sm text-red-600">
        {error}
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
        {loading ? (
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

function SupplementStatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    pending: {
      label: '대기중',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    approved: {
      label: '승인',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
    rejected: {
      label: '반려',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
    },
  }
  const c = config[status] || config.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${c.bgColor} ${c.textColor}`}
    >
      {c.label}
    </span>
  )
}

function SupplementSummaryCard({
  supplement,
  isSelected,
  onClick,
}: {
  supplement: SpotSupplement
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-3 text-left transition-colors ${
        isSelected
          ? 'border-navy-400 bg-navy-50'
          : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600">
              {SUPPLEMENT_TYPE_LABELS[supplement.type] || supplement.type}
            </span>
            <SupplementStatusBadge status={supplement.status} />
          </div>
          <p className="mt-1.5 truncate text-sm font-medium text-gray-800">
            {supplement.content.slice(0, 50)}
            {supplement.content.length > 50 ? '...' : ''}
          </p>
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <span>{supplement.contributorName}</span>
            <span>·</span>
            <span>
              {new Date(supplement.createdAt).toLocaleDateString('ko-KR')}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
