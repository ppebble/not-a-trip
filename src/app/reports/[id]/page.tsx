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
  const router = useRouter()
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
        onConfirm={() => router.push('/auth/login')}
      />
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <p className="text-lg">😥</p>
          <p className="mt-2 text-sm text-navy-600">{error.message}</p>
          <Link
            href="/reports"
            className="mt-4 inline-block rounded-lg bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
          <p className="text-lg">📭</p>
          <p className="mt-2 text-sm text-navy-600">제보를 찾을 수 없습니다</p>
          <Link
            href="/reports"
            className="mt-4 inline-block rounded-lg bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-700"
          >
            목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <Link
            href="/reports"
            className="flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"
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
            <h1 className="text-xl font-bold text-navy-800">제보 상세</h1>
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
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy-800">{report.name}</h2>
            <p className="mt-0.5 text-sm text-navy-400">{report.address}</p>
          </div>
          {categoryConfig && (
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: `${categoryConfig.color}20`,
                color: categoryConfig.color,
              }}
            >
              {categoryConfig.label}
            </span>
          )}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-navy-600">
          {report.description}
        </p>
        {report.episodeInfo && (
          <p className="mt-2 text-sm text-navy-400">📺 {report.episodeInfo}</p>
        )}
      </div>

      {/* 작품 정보 */}
      {report.relatedContent && report.relatedContent.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-700">관련 작품</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {report.relatedContent.map((content, i) => (
              <span
                key={i}
                className="rounded-full bg-navy-50 px-3 py-1 text-xs text-navy-600"
              >
                {content.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 증거 사진 쌍 */}
      {report.evidencePairs.length > 0 && (
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-navy-700">증거 사진</h3>
          <div className="mt-3 space-y-3">
            {report.evidencePairs.map((pair, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <div>
                  <p className="mb-1 text-[10px] text-navy-400">작품 캡처</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={pair.captureImageUrl}
                      alt={`캡처 ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[10px] text-navy-400">현장 사진</p>
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={pair.realPhotoUrl}
                      alt={`현장 ${i + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                {pair.description && (
                  <p className="col-span-2 text-xs text-navy-400">
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
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-navy-400">
          <span>
            제보일: {new Date(report.createdAt).toLocaleDateString('ko-KR')}
          </span>
          {report.approvedSpotId && (
            <Link
              href={`/spots/${report.approvedSpotId}`}
              className="text-navy-600 underline hover:text-navy-800"
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
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-navy-700">검토 이력</h3>
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
                <div className="w-px flex-1 bg-navy-100" />
              )}
            </div>
            <div className="pb-3">
              <div className="flex items-center gap-2">
                <ReportStatusBadge status={entry.status} />
                <span className="text-[10px] text-navy-300">
                  {new Date(entry.reviewedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              {entry.comment && (
                <p className="mt-1 text-xs text-navy-500">{entry.comment}</p>
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
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50/50 p-4">
      <h3 className="text-sm font-semibold text-blue-700">✏️ 제보 수정</h3>
      <p className="mt-1 text-xs text-blue-500">
        관리자 요청에 따라 내용을 수정한 후 재제출하세요
      </p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-xs font-medium text-navy-600">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-600">
            에피소드 정보
          </label>
          <input
            type="text"
            value={episodeInfo}
            onChange={(e) => setEpisodeInfo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={updateReport.isPending}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
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
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <div className="h-4 w-24 animate-pulse rounded bg-navy-100" />
          <div className="mt-3 h-6 w-40 animate-pulse rounded bg-navy-100" />
        </div>
      </div>
      <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-navy-50" />
        ))}
      </div>
    </div>
  )
}
