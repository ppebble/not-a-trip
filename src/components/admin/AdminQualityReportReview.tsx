'use client'

import { useMemo, useState } from 'react'
import {
  useAdminSupplementRequests,
  useCreateAdminSupplementRequest,
  useReviewQualityReport,
  type AdminQualityReport,
} from '@/hooks/useAdminQueries'
import type { SupplementRequestType } from '@/types/spot-quality'
import {
  QualityReportStatusBadge,
  REPORT_TYPE_LABELS,
} from './QualityReportSummaryCard'

const SUPPLEMENT_TYPE_LABELS: Record<SupplementRequestType, string> = {
  photo_add: '사진 추가',
  description_update: '설명 보완',
  address_verify: '주소 확인',
  operation_info: '운영 정보 확인',
}

const DEFAULT_DEADLINE_DAYS = 7

function toInputDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().slice(0, 10)
}

interface AdminQualityReportReviewProps {
  report: AdminQualityReport
  onReviewComplete: () => void
}

export function AdminQualityReportReview({
  report,
  onReviewComplete,
}: AdminQualityReportReviewProps) {
  const [reason, setReason] = useState('')
  const [closeSpot, setCloseSpot] = useState(
    report.reportType === 'closed_permanently'
  )
  const [reviewError, setReviewError] = useState<string | null>(null)

  const [requestType, setRequestType] =
    useState<SupplementRequestType>('description_update')
  const [requestContent, setRequestContent] = useState('')
  const [deadline, setDeadline] = useState(toInputDate(DEFAULT_DEADLINE_DAYS))
  const [requestError, setRequestError] = useState<string | null>(null)

  const reviewMutation = useReviewQualityReport()
  const createSupplementRequest = useCreateAdminSupplementRequest()
  const { data: supplementRequests } = useAdminSupplementRequests(report.spotId)

  const isOpen = ['pending', 'in_review', 'sla_exceeded'].includes(
    report.status
  )

  const deadlineState = useMemo(() => {
    const deadlineDate = new Date(report.deadline)
    const diffMs = deadlineDate.getTime() - Date.now()
    const diffHours = Math.ceil(diffMs / (60 * 60 * 1000))

    if (report.status === 'sla_exceeded' || diffHours < 0) {
      return `SLA ${Math.abs(diffHours)}시간 초과`
    }
    return `SLA ${diffHours}시간 남음`
  }, [report.deadline, report.status])

  const handleReview = async (action: 'approved' | 'rejected' | 'deferred') => {
    if (!reason.trim()) {
      setReviewError('검토 사유를 입력해 주세요.')
      return
    }

    try {
      setReviewError(null)
      await reviewMutation.mutateAsync({
        id: report.id,
        action,
        reason: reason.trim(),
        closeSpot: action === 'approved' ? closeSpot : false,
      })
      setReason('')
      onReviewComplete()
    } catch (error) {
      setReviewError(
        error instanceof Error ? error.message : '검토 처리에 실패했습니다.'
      )
    }
  }

  const handleCreateSupplementRequest = async () => {
    if (!requestContent.trim()) {
      setRequestError('보완 요청 내용을 입력해 주세요.')
      return
    }
    if (!deadline) {
      setRequestError('기한을 선택해 주세요.')
      return
    }

    try {
      setRequestError(null)
      await createSupplementRequest.mutateAsync({
        spotId: report.spotId,
        requestType,
        content: requestContent.trim(),
        deadline: new Date(`${deadline}T23:59:59`).toISOString(),
      })
      setRequestContent('')
      setDeadline(toInputDate(DEFAULT_DEADLINE_DAYS))
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : '보완 요청 생성에 실패했습니다.'
      )
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-neutral-800">
                {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
              </h2>
              <QualityReportStatusBadge status={report.status} />
              {report.isUrgent && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  긴급 검토
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-500">
              신고 ID {report.id} · 스팟 ID {report.spotId}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700">
            {deadlineState}
          </div>
        </div>

        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">
            신고 내용
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-neutral-400">신고자</dt>
              <dd className="mt-0.5 font-medium text-neutral-700">
                {report.reporterName}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">접수일</dt>
              <dd className="mt-0.5 font-medium text-neutral-700">
                {new Date(report.createdAt).toLocaleString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">마감</dt>
              <dd className="mt-0.5 font-medium text-neutral-700">
                {new Date(report.deadline).toLocaleString('ko-KR')}
              </dd>
            </div>
            <div>
              <dt className="text-neutral-400">유형</dt>
              <dd className="mt-0.5 font-medium text-neutral-700">
                {REPORT_TYPE_LABELS[report.reportType] ?? report.reportType}
              </dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <p className="whitespace-pre-wrap text-sm text-neutral-700">
              {report.description}
            </p>
          </div>
          {report.evidencePhotos && report.evidencePhotos.length > 0 && (
            <div className="mt-4 border-t border-neutral-100 pt-4">
              <p className="mb-2 text-sm font-medium text-neutral-600">
                증빙 사진
              </p>
              <div className="space-y-1 text-sm">
                {report.evidencePhotos.map((photo) => (
                  <a
                    key={photo}
                    href={photo}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-primary hover:underline"
                  >
                    {photo}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">
            보완 요청
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                요청 유형
              </label>
              <select
                value={requestType}
                onChange={(event) =>
                  setRequestType(event.target.value as SupplementRequestType)
                }
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              >
                {Object.entries(SUPPLEMENT_TYPE_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">
                응답 기한
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <textarea
            value={requestContent}
            onChange={(event) => {
              setRequestContent(event.target.value)
              setRequestError(null)
            }}
            placeholder="기여자에게 요청할 보완 내용을 입력하세요."
            rows={3}
            className="mt-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          {requestError && (
            <p className="mt-2 text-sm text-red-500">{requestError}</p>
          )}
          <button
            onClick={handleCreateSupplementRequest}
            disabled={createSupplementRequest.isPending}
            className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {createSupplementRequest.isPending
              ? '생성 중...'
              : '보완 요청 생성'}
          </button>

          {(supplementRequests?.requests?.length ?? 0) > 0 && (
            <div className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
              <p className="text-sm font-medium text-neutral-600">
                기존 보완 요청
              </p>
              {supplementRequests?.requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-neutral-700">
                      {SUPPLEMENT_TYPE_LABELS[request.requestType] ??
                        request.requestType}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {request.status}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2">{request.content}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-lg border border-neutral-200 bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-neutral-700">
            검토 처리
          </h3>
          {report.resolution && (
            <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-sm text-neutral-600">
              <p className="font-medium text-neutral-700">기존 처리 결과</p>
              <p className="mt-1">{report.resolution.reason}</p>
            </div>
          )}
          <textarea
            value={reason}
            onChange={(event) => {
              setReason(event.target.value)
              setReviewError(null)
            }}
            placeholder="검토 사유를 입력하세요."
            rows={3}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          {report.reportType === 'closed_permanently' && (
            <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
              <input
                type="checkbox"
                checked={closeSpot}
                onChange={(event) => setCloseSpot(event.target.checked)}
                className="rounded border-neutral-300"
              />
              승인 시 스팟을 폐업/폐쇄 상태로 전환
            </label>
          )}
          {reviewError && (
            <p className="mt-2 text-sm text-red-500">{reviewError}</p>
          )}

          {isOpen ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => handleReview('approved')}
                disabled={reviewMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                승인/해결
              </button>
              <button
                onClick={() => handleReview('deferred')}
                disabled={reviewMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                추가 검토 유지
              </button>
              <button
                onClick={() => handleReview('rejected')}
                disabled={reviewMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                반려
              </button>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-500">
              이미 최종 처리된 신고입니다.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
