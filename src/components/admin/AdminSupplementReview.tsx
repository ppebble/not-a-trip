'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SpotSupplement } from '@/types/report'

const SUPPLEMENT_TYPE_LABELS: Record<string, string> = {
  scene_info: '씬 정보',
  description: '설명',
  photo: '사진',
  other: '기타',
}

interface AdminSupplementReviewProps {
  supplement: SpotSupplement
  onReviewComplete: () => void
}

/**
 * 관리자 정보 보완 상세/검토 컴포넌트
 * Requirements: 3.2, 3.4, 3.5
 * - 보완 유형, 내용, 씬 정보, 사진, 기여자, 대상 스팟명 상세 표시
 * - 승인/반려 액션 + 반려 사유 입력
 * - API 호출 성공/실패 시 인라인 메시지 표시
 */
export function AdminSupplementReview({
  supplement,
  onReviewComplete,
}: AdminSupplementReviewProps) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRejectForm, setShowRejectForm] = useState(false)

  const isPending = supplement.status === 'pending'

  const handleApprove = async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/admin/supplements/${supplement.id}/review`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve' }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '승인 처리 실패')
      }

      onReviewComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('반려 사유를 입력해주세요')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/admin/supplements/${supplement.id}/review`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reject',
            rejectionReason: rejectionReason.trim(),
          }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '반려 처리 실패')
      }

      setRejectionReason('')
      onReviewComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('이 정보 보완 검토 항목을 삭제하시겠습니까?')) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await fetch(
        `/api/admin/supplements/${supplement.id}/review`,
        {
          method: 'DELETE',
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '삭제 처리 실패')
      }

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
            <h2 className="text-xl font-bold text-main-text">정보 보완 상세</h2>
            <p className="mt-1 text-sm text-sub-text">
              스팟 ID: {supplement.spotId}
            </p>
          </div>
          <SupplementStatusBadge status={supplement.status} />
        </div>

        {/* 기본 정보 */}
        <section className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-main-text">
            기본 정보
          </h3>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-sub-text">보완 유형</dt>
              <dd className="mt-0.5 font-medium text-main-text">
                {SUPPLEMENT_TYPE_LABELS[supplement.type] || supplement.type}
              </dd>
            </div>
            <div>
              <dt className="text-sub-text">기여자</dt>
              <dd className="mt-0.5 font-medium text-main-text">
                {supplement.contributorName}
              </dd>
            </div>
            <div>
              <dt className="text-sub-text">제출일</dt>
              <dd className="mt-0.5 font-medium text-main-text">
                {new Date(supplement.createdAt).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </div>
          </dl>
        </section>

        {/* 보완 내용 */}
        <section className="rounded-lg border border-border bg-surface p-4">
          <h3 className="mb-3 text-sm font-semibold text-main-text">
            보완 내용
          </h3>
          <p className="whitespace-pre-wrap text-sm text-main-text">
            {supplement.content}
          </p>
        </section>

        {/* 씬 정보 (scene_info 타입) */}
        {supplement.type === 'scene_info' && supplement.sceneInfo && (
          <section className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-main-text">
              씬 정보
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-sub-text">작품명</dt>
                <dd className="mt-0.5 font-medium text-main-text">
                  {supplement.sceneInfo.animeTitle}
                </dd>
              </div>
              {supplement.sceneInfo.episodeInfo && (
                <div>
                  <dt className="text-sub-text">에피소드</dt>
                  <dd className="mt-0.5 font-medium text-main-text">
                    {supplement.sceneInfo.episodeInfo}
                  </dd>
                </div>
              )}
              {supplement.sceneInfo.captureImageUrl && (
                <div>
                  <dt className="mb-1 text-sub-text">캡처 이미지</dt>
                  <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg">
                    <Image
                      src={supplement.sceneInfo.captureImageUrl}
                      alt="씬 캡처"
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* 사진 (photo 타입) */}
        {supplement.photos && supplement.photos.length > 0 && (
          <section className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-main-text">
              첨부 사진 ({supplement.photos.length}장)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {supplement.photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <Image
                    src={photo}
                    alt={`첨부 사진 ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 반려 사유 (이미 반려된 경우) */}
        {supplement.status === 'rejected' && supplement.rejectionReason && (
          <div className="rounded-lg bg-danger-surface p-4">
            <p className="text-sm font-medium text-danger">반려 사유</p>
            <p className="mt-1 text-sm text-danger">
              {supplement.rejectionReason}
            </p>
          </div>
        )}

        {/* 검토 액션 (pending 상태일 때만) */}
        {isPending && (
          <section className="rounded-lg border border-border bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-main-text">검토</h3>

            {error && <p className="mb-3 text-sm text-danger">{error}</p>}

            {showRejectForm ? (
              <div className="space-y-3">
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value)
                    setError(null)
                  }}
                  placeholder="반려 사유를 입력하세요 (필수)"
                  rows={3}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
                  >
                    {loading ? '처리중...' : '❌ 반려 확인'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false)
                      setRejectionReason('')
                      setError(null)
                    }}
                    disabled={loading}
                    className="rounded-lg bg-muted/15 px-4 py-2 text-sm font-medium text-sub-text transition-colors hover:bg-muted/25 disabled:opacity-50"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-secondary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-700 disabled:opacity-50"
                >
                  {loading ? '처리중...' : '✅ 승인'}
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="flex-1 rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
                >
                  ❌ 반려
                </button>
              </div>
            )}
          </section>
        )}

        {/* 이미 처리된 보완 안내 */}
        {!isPending && supplement.status !== 'rejected' && (
          <div className="rounded-lg bg-muted/10 p-4 text-center text-sm text-sub-text">
            이미 처리된 정보 보완입니다
          </div>
        )}

        <section className="rounded-lg border border-danger bg-danger-surface p-4">
          <h3 className="mb-2 text-sm font-semibold text-danger">
            검토 항목 삭제
          </h3>
          <p className="mb-3 text-xs text-danger">
            잘못 접수되었거나 중복된 정보 보완 요청만 삭제하세요.
          </p>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90 disabled:opacity-50"
          >
            {loading ? '처리중...' : '삭제'}
          </button>
        </section>
      </div>
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
      bgColor: 'bg-sunset-100',
      textColor: 'text-sunset-700',
    },
    approved: {
      label: '승인',
      bgColor: 'bg-secondary-100',
      textColor: 'text-secondary-700',
    },
    rejected: {
      label: '반려',
      bgColor: 'bg-danger-surface',
      textColor: 'text-danger',
    },
  }
  const c = config[status] || config.pending

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${c.bgColor} ${c.textColor}`}
    >
      {c.label}
    </span>
  )
}
