'use client'

import { useState } from 'react'
import {
  useCreateQualityReport,
  useQualityReportSummary,
} from '@/hooks/useQualityReport'
import type { QualityReportType } from '@/types/spot-quality'

interface QualityReportFormProps {
  spotId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const REPORT_TYPES: Array<{
  value: QualityReportType
  label: string
  description: string
}> = [
  {
    value: 'inaccurate_info',
    label: '정보 오류',
    description: '설명, 주소, 운영 정보가 부정확해요.',
  },
  {
    value: 'closed_permanently',
    label: '폐업/폐쇄',
    description: '더 이상 운영하지 않거나 접근이 불가능해요.',
  },
  {
    value: 'duplicate',
    label: '중복 스팟',
    description: '기존 스팟과 같은 장소로 보여요.',
  },
  {
    value: 'inappropriate',
    label: '부적절',
    description: '부적절하거나 잘못된 콘텐츠가 포함돼 있어요.',
  },
  {
    value: 'other',
    label: '기타',
    description: '그 외 관리자 검토가 필요한 사항이에요.',
  },
]

const REPORT_LABELS: Record<QualityReportType, string> = {
  inaccurate_info: '정보 오류',
  closed_permanently: '폐업/폐쇄',
  duplicate: '중복 스팟',
  inappropriate: '부적절',
  other: '기타',
}

export function QualityReportForm({
  spotId,
  onSuccess,
  onCancel,
}: QualityReportFormProps) {
  const [reportType, setReportType] = useState<QualityReportType | null>(null)
  const [description, setDescription] = useState('')
  const [success, setSuccess] = useState(false)
  const { data: summary } = useQualityReportSummary(spotId)
  const createReport = useCreateQualityReport(spotId)

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) return

    try {
      await createReport.mutateAsync({
        reportType,
        description: description.trim(),
      })
      setSuccess(true)
      onSuccess?.()
    } catch {
      // mutation state handles message below
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-700">
          품질 신고가 접수되었습니다.
        </p>
        <p className="mt-1 text-xs text-green-600">
          관리자 검토 후 스팟 상태에 반영됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {summary && (
        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="text-sm font-medium text-primary">기존 신고 요약</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(summary.countsByType).length === 0 ? (
              <span className="text-xs text-muted">
                아직 누적 신고가 없습니다.
              </span>
            ) : (
              Object.entries(summary.countsByType).map(([type, count]) => (
                <span
                  key={type}
                  className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-secondary"
                >
                  {REPORT_LABELS[type as QualityReportType]} {count}건
                </span>
              ))
            )}
          </div>
          {summary.recentReports.length > 0 && (
            <div className="mt-3 space-y-2">
              {summary.recentReports.slice(0, 3).map((report) => (
                <div key={report.id} className="rounded-md bg-neutral-50 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-primary">
                      {REPORT_LABELS[report.reportType]}
                    </span>
                    <span className="text-[11px] text-muted">
                      {new Date(report.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-secondary">
                    {report.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-primary">
          신고 유형 <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {REPORT_TYPES.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => setReportType(type.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                reportType === type.value
                  ? 'border-red-300 bg-red-50'
                  : 'border-border hover:border-neutral-300'
              }`}
            >
              <p className="text-sm font-medium text-primary">{type.label}</p>
              <p className="mt-1 text-xs text-muted">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-primary">
          상세 설명 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="무엇이 잘못되었는지, 왜 검토가 필요한지 구체적으로 적어 주세요."
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-muted">
          {description.length}/500
        </p>
      </div>

      {createReport.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          {createReport.error.message}
        </p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-secondary transition-colors hover:bg-surface"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !reportType || !description.trim() || createReport.isPending
          }
          className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createReport.isPending ? '제출 중...' : '품질 신고'}
        </button>
      </div>
    </div>
  )
}
