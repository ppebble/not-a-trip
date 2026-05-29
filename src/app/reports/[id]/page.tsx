'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useReportDetail, useUpdateReport } from '@/hooks/useSpotReport'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import { LoginRequiredModal } from '@/components/common/LoginRequiredModal'
import { CATEGORY_CONFIG } from '@/types/spot'
import type { SpotReport, ReviewHistory } from '@/types/report'
import Image from 'next/image'
import Link from 'next/link'

/**
 * 제보 상세/수정 페이지
 * Requirements: 1.6
 */
export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const { data: report, isLoading, error } = useReportDetail(reportId)

  if (authLoading || isLoading) {
    return <ReportDetailSkeleton />
  }

  if (!isAuthenticated || !user) {
    return (
      <LoginRequiredModal
        isOpen={true}
        title="로그인이 필요한 서비스입니다"
        description="제보 상세를 확인하려면 로그인이 필요합니다."
      />
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-md">
          <p className="text-lg">😥</p>
          <p className="mt-2 text-sm text-secondary">{error.message}</p>
          <Link
            href="/reports"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-surface p-8 text-center shadow-md">
          <p className="text-lg">📭</p>
          <p className="mt-2 text-sm text-secondary">제보를 찾을 수 없습니다</p>
          <Link
            href="/reports"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 헤더 */}
      <div className="border-b border-neutral-200 bg-surface px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/reports"
            className="flex items-center gap-2 text-sm text-secondary hover:text-text-primary"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            내 제보 목록
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-xl font-bold text-primary">제보 상세</h1>
            <ReportStatusBadge status={report.status} size="md" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-lg px-4 py-6">
        <ReportDetailContent report={report} />
      </main>
    </div>
  )
}

/** 제보 상세 콘텐츠 */
function ReportDetailContent({ report }: { report: SpotReport }) {
  const categoryConfig = report.category
    ? CATEGORY_CONFIG[report.category]
    : null

  return (
    <div className="space-y-4">
      {/* 관리자 코멘트 (수정요청/반려 시) */}
      {report.reviewComment &&
        (report.status === 'revision_requested' ||
          report.status === 'rejected') && (
          <div
            className={`rounded-lg border p-4 ${
              report.status === 'revision_requested'
                ? 'border-blue-200 bg-blue-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <p
              className={`text-sm font-medium ${
                report.status === 'revision_requested'
                  ? 'text-blue-700'
                  : 'text-red-700'
              }`}
            >
              {report.status === 'revision_requested'
                ? '💬 관리자 수정 요청'
                : '❌ 반려 사유'}
            </p>
            <p
              className={`mt-1 text-sm ${
                report.status === 'revision_requested'
                  ? 'text-blue-600'
                  : 'text-red-600'
              }`}
            >
              {report.reviewComment}
            </p>
          </div>
        )}

      {/* 장소 정보 */}
      <div className="rounded-lg bg-surface p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-primary">{report.name}</h2>
            <p className="mt-0.5 text-sm text-muted">{report.address}</p>
          </div>
          {categoryConfig && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: categoryConfig.bgColor,
                color: categoryConfig.fgColor,
              }}
            >
              {categoryConfig.label}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-secondary">
          {report.description}
        </p>
        {report.episodeInfo && (
          <p className="mt-2 text-sm text-muted">📺 {report.episodeInfo}</p>
        )}
      </div>

      {/* 작품 정보 */}
      {report.relatedContent && report.relatedContent.length > 0 && (
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-secondary">관련 작품</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.relatedContent.map((content, i) => (
              <span
                key={i}
                className="rounded-full bg-primary-50 px-3 py-1 text-xs text-secondary"
              >
                {content.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 증거 사진 쌍 */}
      {report.evidencePairs.length > 0 && (
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-secondary">증거 사진</h3>
          <div className="mt-3 space-y-3">
            {report.evidencePairs.map((pair, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10px] text-muted">작품 캡처</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={pair.captureImageUrl}
                      alt={`캡처 ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-muted">현장 사진</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={pair.realPhotoUrl}
                      alt={`현장 ${i + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                {pair.description && (
                  <p className="col-span-2 text-xs text-muted">
                    {pair.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 검토 히스토리 */}
      {report.reviewHistory && report.reviewHistory.length > 0 && (
        <ReviewHistoryTimeline history={report.reviewHistory} />
      )}

      {/* 제출 정보 */}
      <div className="rounded-lg bg-surface p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            제보일: {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </span>
          {report.approvedSpotId && (
            <Link
              href={`/spots/${report.approvedSpotId}`}
              className="text-secondary underline hover:text-primary"
            >
              승인된 스팟 보기 →
            </Link>
          )}
        </div>
      </div>

      {/* 수정요청 상태일 때 수정 폼 */}
      {report.status === 'revision_requested' && (
        <RevisionForm report={report} />
      )}
    </div>
  )
}

/** 검토 히스토리 타임라인 */
function ReviewHistoryTimeline({ history }: { history: ReviewHistory[] }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-secondary">검토 이력</h3>
      <div className="mt-3 space-y-3">
        {history.map((entry, i) => (
          <div key={i} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  entry.status === 'approved'
                    ? 'bg-green-500'
                    : entry.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                }`}
              />
              {i < history.length - 1 && (
                <div className="w-px flex-1 bg-surface" />
              )}
            </div>
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <ReportStatusBadge status={entry.status} />
                <span className="text-[10px] text-neutral-300">
                  {new Date(entry.reviewedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {entry.comment && (
                <p className="mt-1 text-xs text-secondary">{entry.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 수정요청 대응 폼 */
function RevisionForm({ report }: { report: SpotReport }) {
  const router = useRouter()
  const updateReport = useUpdateReport()
  const [description, setDescription] = useState(report.description)
  const [episodeInfo, setEpisodeInfo] = useState(report.episodeInfo)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    try {
      await updateReport.mutateAsync({
        id: report.id,
        input: {
          name: report.name,
          description,
          address: report.address,
          coordinates: report.coordinates,
          category: report.category,
          relatedContent: report.relatedContent,
          evidencePairs: report.evidencePairs,
          episodeInfo,
          additionalPhotos: report.additionalPhotos,
        },
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정에 실패했습니다')
    }
  }

  return (
    <div className="rounded-lg border-2 border-primary-200 bg-accent-surface p-4">
      <h3 className="text-sm font-semibold text-primary">✏️ 제보 수정</h3>
      <p className="mt-1 text-xs text-primary">
        관리자 요청에 따라 내용을 수정한 후 재제출하세요
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-secondary">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-secondary">
            에피소드 정보
          </label>
          <input
            type="text"
            value={episodeInfo}
            onChange={(e) => setEpisodeInfo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={updateReport.isPending}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {updateReport.isPending ? '제출 중...' : '수정 후 재제출'}
        </button>
      </div>
    </div>
  )
}

/** 스켈레톤 */
function ReportDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="border-b border-neutral-200 bg-surface px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="mt-3 h-6 w-40 animate-pulse rounded bg-surface" />
        </div>
      </div>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-primary-50"
          />
        ))}
      </div>
    </div>
  )
}
