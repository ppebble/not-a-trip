'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SpotStatusReport, SpotStatus } from '@/types/report'

const SPOT_STATUS_LABELS: Record<string, string> = {
  normal: '정상',
  partially_changed: '일부 변경',
  under_construction: '공사중',
  demolished: '소실됨',
  inaccessible: '접근 불가',
}

const SPOT_STATUS_OPTIONS: { value: SpotStatus; label: string }[] = [
  { value: 'normal', label: '정상' },
  { value: 'partially_changed', label: '일부 변경' },
  { value: 'under_construction', label: '공사중' },
  { value: 'demolished', label: '소실됨' },
  { value: 'inaccessible', label: '접근 불가' },
]

interface AdminStatusReportReviewProps {
  report: SpotStatusReport
  onReviewComplete: () => void
}

/**
 * 관리자 상태 신고 상세/검토 컴포넌트
 * Requirements: 5.2, 5.4, 5.5
 * - 신고 상태, 설명, 증거 사진, 신고자, 대상 스팟명, 현재 스팟 상태 상세 표시
 * - 확인 처리 버튼: PUT /api/admin/status-reports/[id]/review
 * - 스팟 상태 수동 변경: 상태 선택 드롭다운 + PUT /api/admin/status-reports/spots/[spotId]/status
 * - API 호출 성공/실패 시 인라인 메시지 표시
 */
export function AdminStatusReportReview({
  report,
  onReviewComplete,
}: AdminStatusReportReviewProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<SpotStatus>(
    report.status
  )

  const isPending = report.reviewStatus === 'pending'

  const handleResolve = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch(`/api/admin/status-reports/${report.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '확인 처리 실패')
      }

      onReviewComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleChangeSpotStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccessMessage(null)

      const res = await fetch(
        `/api/admin/status-reports/spots/${report.spotId}/status`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: selectedStatus }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '스팟 상태 변경 실패')
      }

      setSuccessMessage('스팟 상태가 변경되었습니다')
      onReviewComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">상태 신고 상세</h2>
            <p className="mt-1 text-sm text-gray-500">
              스팟 ID: {report.spotId}
            </p>
          </div>
          <ReviewStatusBadge reviewStatus={report.reviewStatus} />
        </div>

        {/* 기본 정보 */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            기본 정보
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">신고 상태</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {SPOT_STATUS_LABELS[report.status] || report.status}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">신고자</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {report.reporterName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">신고일</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </section>

        {/* 설명 */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            신고 내용
          </h3>
          <p className="whitespace-pre-wrap text-sm text-gray-700">
            {report.description}
          </p>
        </section>

        {/* 증거 사진 */}
        {report.photoUrl && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              증거 사진
            </h3>
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg">
              <Image
                src={report.photoUrl}
                alt="증거 사진"
                fill
                className="object-cover"
              />
            </div>
          </section>
        )}

        {/* 인라인 메시지 */}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}

        {/* 검토 액션 (pending 상태일 때만) */}
        {isPending && (
          <section className="space-y-4">
            {/* 확인 처리 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                확인 처리
              </h3>
              <button
                onClick={handleResolve}
                disabled={loading}
                className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '처리중...' : '✅ 확인 완료'}
              </button>
            </div>

            {/* 스팟 상태 수동 변경 */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-700">
                스팟 상태 수동 변경
              </h3>
              <p className="mb-3 text-xs text-gray-400">
                스팟 상태를 변경하면 해당 스팟의 대기 중인 모든 신고가 자동으로
                확인 완료 처리됩니다
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as SpotStatus)
                  }
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
                  aria-label="스팟 상태 선택"
                >
                  {SPOT_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleChangeSpotStatus}
                  disabled={loading}
                  className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700 disabled:opacity-50"
                >
                  {loading ? '처리중...' : '변경'}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 이미 처리된 신고 안내 */}
        {!isPending && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
            이미 확인 완료된 상태 신고입니다
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewStatusBadge({ reviewStatus }: { reviewStatus: string }) {
  const config: Record<
    string,
    { label: string; bgColor: string; textColor: string }
  > = {
    pending: {
      label: '대기 중',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-700',
    },
    resolved: {
      label: '확인 완료',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
    },
  }
  const c = config[reviewStatus] || config.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${c.bgColor} ${c.textColor}`}
    >
      {c.label}
    </span>
  )
}
