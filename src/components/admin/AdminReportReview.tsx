'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ReportStatusBadge } from '@/components/report/ReportStatusBadge'
import { CATEGORY_CONFIG } from '@/types/spot'
import type { SpotReport, ReviewHistory } from '@/types/report'

interface AdminReportReviewProps {
  report: SpotReport
  onReviewComplete: () => void
}

/**
 * 관리자 제보 검토 컴포넌트
 * Requirements: 5.2, 5.3
 * - 제보 상세 정보 표시 (증거 사진 쌍, 지도 위치, 작품 정보)
 * - 승인/반려/수정요청 버튼 + 코멘트 입력
 * - 검토 히스토리(reviewHistory) 타임라인 표시
 */
export function AdminReportReview({
  report,
  onReviewComplete,
}: AdminReportReviewProps) {
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categoryConfig = report.category
    ? CATEGORY_CONFIG[report.category]
    : null
  const isPending = report.status === 'pending'

  const handleReview = async (
    action: 'approve' | 'reject' | 'request_revision'
  ) => {
    if (action === 'reject' && !comment.trim()) {
      setError('반려 사유를 입력해주세요')
      return
    }
    if (action === 'request_revision' && !comment.trim()) {
      setError('수정 요청 사유를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(`/api/admin/reports/${report.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment: comment.trim() }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '검토 처리 실패')
      }

      setComment('')
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
            <h2 className="text-xl font-bold text-gray-800">{report.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{report.address}</p>
          </div>
          <ReportStatusBadge status={report.status} size="md" />
        </div>

        {/* 기본 정보 */}
        <section className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            기본 정보
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-400">카테고리</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {categoryConfig?.label || '미분류'}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">제보자</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {report.reporterName}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">제출일</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
            <div>
              <dt className="text-gray-400">좌표</dt>
              <dd className="mt-0.5 font-medium text-gray-700">
                {report.coordinates.lat.toFixed(5)},{' '}
                {report.coordinates.lng.toFixed(5)}
              </dd>
            </div>
          </dl>
          {report.description && (
            <div className="mt-3 border-t border-gray-100 pt-3">
              <dt className="text-sm text-gray-400">설명</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {report.description}
              </dd>
            </div>
          )}
        </section>

        {/* 작품 정보 */}
        {report.relatedContent && report.relatedContent.length > 0 && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              작품 정보
            </h3>
            <div className="space-y-2">
              {report.relatedContent.map((content, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-gray-700">
                    {content.name}
                  </span>
                  {content.year && (
                    <span className="text-gray-400">({content.year})</span>
                  )}
                </div>
              ))}
            </div>
            {report.episodeInfo && (
              <p className="mt-2 text-sm text-gray-500">
                에피소드: {report.episodeInfo}
              </p>
            )}
          </section>
        )}

        {/* 증거 사진 쌍 */}
        {report.evidencePairs && report.evidencePairs.length > 0 && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              증거 사진 ({report.evidencePairs.length}쌍)
            </h3>
            <div className="space-y-4">
              {report.evidencePairs.map((pair, idx) => (
                <div key={idx} className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-2 text-xs font-medium text-gray-500">
                    #{idx + 1}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-xs text-gray-400">작품 캡처</p>
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={pair.captureImageUrl}
                          alt={`캡처 ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-xs text-gray-400">현장 사진</p>
                      <div className="relative aspect-video overflow-hidden rounded-lg">
                        <Image
                          src={pair.realPhotoUrl}
                          alt={`현장 ${idx + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  </div>
                  {pair.description && (
                    <p className="mt-2 text-xs text-gray-500">
                      {pair.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 검토 히스토리 */}
        {report.reviewHistory && report.reviewHistory.length > 0 && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">
              검토 히스토리
            </h3>
            <div className="relative space-y-3 pl-4">
              {/* 타임라인 라인 */}
              <div className="absolute bottom-0 left-1.5 top-0 w-px bg-gray-200" />
              {report.reviewHistory.map(
                (history: ReviewHistory, idx: number) => (
                  <div key={idx} className="relative">
                    {/* 타임라인 도트 */}
                    <div className="absolute -left-4 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gray-400" />
                    <div className="rounded-md bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <ReportStatusBadge status={history.status} />
                        <span className="text-xs text-gray-400">
                          {new Date(history.reviewedAt).toLocaleDateString(
                            'ko-KR',
                            {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )}
                        </span>
                      </div>
                      {history.comment && (
                        <p className="mt-1.5 text-sm text-gray-600">
                          {history.comment}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* 검토 액션 (pending 상태일 때만) */}
        {isPending && (
          <section className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">검토</h3>

            {/* 코멘트 입력 */}
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value)
                setError(null)
              }}
              placeholder="코멘트를 입력하세요 (반려/수정요청 시 필수)"
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-navy-400 focus:outline-none focus:ring-1 focus:ring-navy-400"
            />

            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            {/* 액션 버튼 */}
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => handleReview('approve')}
                disabled={loading}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? '처리중...' : '✅ 승인'}
              </button>
              <button
                onClick={() => handleReview('request_revision')}
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '처리중...' : '✏️ 수정요청'}
              </button>
              <button
                onClick={() => handleReview('reject')}
                disabled={loading}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? '처리중...' : '❌ 반려'}
              </button>
            </div>
          </section>
        )}

        {/* 이미 처리된 제보 안내 */}
        {!isPending && (
          <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-500">
            이미 처리된 제보입니다
            {report.reviewComment && (
              <p className="mt-1 text-gray-600">💬 {report.reviewComment}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
