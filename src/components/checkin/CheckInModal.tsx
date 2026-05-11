'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { CheckInInput, UserBadge, SpotContentRelation, Scene } from '@/types'
import { useUploadQueueStore } from '@/stores/uploadQueueStore'
import RelationSelector from './RelationSelector'
import { getSceneImageForContent } from '@/components/spot/SceneComparison'

interface CheckInModalProps {
  isOpen: boolean
  onClose: () => void
  spotId: string
  spotName: string
  sceneImageUrl?: string
  onSuccess?: (earnedBadges?: UserBadge[]) => void
}

/**
 * 인증샷 업로드 모달
 * Requirements: 1.1, 1.2, 1.4
 */
export function CheckInModal({
  isOpen,
  onClose,
  spotId,
  spotName,
  sceneImageUrl,
  onSuccess,
}: CheckInModalProps) {
  const router = useRouter()
  const [photoUrl, setPhotoUrl] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [visitedAt, setVisitedAt] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [comment, setComment] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadQueue = useUploadQueueStore((state) => state.queue)
  const activeUploads = uploadQueue.filter(
    (item) => item.status === 'uploading'
  )

  // === Relation 선택 상태 (Requirements 3.1~3.7) ===
  const [relations, setRelations] = useState<SpotContentRelation[]>([])
  const [selectedRelationId, setSelectedRelationId] = useState<string | null>(
    null
  )
  const [relationsLoading, setRelationsLoading] = useState(false)
  const [relationsError, setRelationsError] = useState<string | null>(null)
  // === Scene 데이터 (Requirements 6.5) ===
  const [scenes, setScenes] = useState<Scene[]>([])

  // 모달 열릴 때 relations 조회 (Requirements 3.1)
  useEffect(() => {
    if (!isOpen) return

    const fetchRelations = async () => {
      setRelationsLoading(true)
      setRelationsError(null)
      try {
        const res = await fetch(`/api/spots/${spotId}/relations`)
        if (!res.ok) throw new Error('작품 정보를 불러올 수 없습니다')
        const data = await res.json()
        const activeRelations: SpotContentRelation[] = data.relations || []
        setRelations(activeRelations)

        // 1개일 때 자동 선택 (Requirements 3.5)
        if (activeRelations.length === 1) {
          setSelectedRelationId(activeRelations[0].id)
        } else {
          setSelectedRelationId(null)
        }
      } catch {
        setRelationsError('작품 정보를 불러올 수 없습니다')
      } finally {
        setRelationsLoading(false)
      }
    }

    fetchRelations()
  }, [isOpen, spotId])

  // 모달 열릴 때 scenes 조회 (Requirements 6.5)
  useEffect(() => {
    if (!isOpen) return

    const fetchScenes = async () => {
      try {
        const res = await fetch(`/api/spots/${spotId}/scenes`)
        if (!res.ok) return
        const data = await res.json()
        setScenes(data.scenes || [])
      } catch {
        // 장면 조회 실패는 무시 (sceneImageUrl 폴백 사용)
      }
    }

    fetchScenes()
  }, [isOpen, spotId])

  // 선택된 작품의 contentName 결정
  const selectedContentName = useMemo(() => {
    if (!selectedRelationId) return undefined
    const relation = relations.find((r) => r.id === selectedRelationId)
    return relation?.contentName
  }, [selectedRelationId, relations])

  // 선택된 작품의 대표 장면을 sceneImageUrl로 사용 (Requirements 6.5)
  const effectiveSceneImageUrl = useMemo(() => {
    if (scenes.length > 0 && relations.length > 0) {
      const dynamicUrl = getSceneImageForContent(
        scenes,
        relations,
        selectedContentName
      )
      if (dynamicUrl) return dynamicUrl
    }
    // 폴백: props로 전달된 sceneImageUrl
    return sceneImageUrl
  }, [scenes, relations, selectedContentName, sceneImageUrl])

  // 다중 relation 스팟에서 선택 필수 여부
  const requiresRelationSelection = relations.length >= 2 && !selectedRelationId

  if (!isOpen) return null

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 이미지 업로드
    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('업로드 실패')

      const data = await res.json()
      setPhotoUrl(data.imageUrl)
    } catch {
      setError('이미지 업로드에 실패했습니다')
      setPhotoPreview(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!photoUrl) {
      setError('인증샷을 업로드해주세요')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const input: CheckInInput = {
        spotId,
        photoUrl,
        sceneImageUrl: effectiveSceneImageUrl,
        visitedAt: new Date(visitedAt),
        comment: comment.trim() || undefined,
        // relation 선택 포함 (Requirements 3.4)
        ...(selectedRelationId && { relationId: selectedRelationId }),
      }

      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '인증 실패')
      }

      const data = await res.json()

      // 초기화
      setPhotoUrl('')
      setPhotoPreview(null)
      setComment('')
      setVisitedAt(new Date().toISOString().split('T')[0])

      setIsSuccess(true)
      onSuccess?.(data.earnedBadges)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !isUploading) {
      setPhotoUrl('')
      setPhotoPreview(null)
      setComment('')
      setError(null)
      setIsSuccess(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-surface">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-bold">순례 인증</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting || isUploading}
            className="rounded-full p-1 hover:bg-surface"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 인증 성공 CTA UI */}
        {isSuccess ? (
          <div className="p-4">
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                인증 완료!
              </h3>
              <p className="mb-6 text-sm text-gray-500">
                순례 인증이 성공적으로 등록되었습니다
              </p>

              {/* CTA 버튼 영역 */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/gallery?tab=my')}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
                >
                  내 인증 보기
                </button>

                {selectedContentName && (
                  <button
                    onClick={() =>
                      router.push(`/contents/${selectedContentName}`)
                    }
                    className="w-full rounded-lg border border-blue-600 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    같은 작품 더 보기
                  </button>
                )}

                <button
                  onClick={handleClose}
                  className="w-full rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4">
            {/* 스팟 정보 */}
            <div className="mb-4 rounded-lg bg-surface p-3">
              <p className="text-sm text-secondary">인증 장소</p>
              <p className="text-text-primary font-medium">{spotName}</p>
            </div>

            {/* Relations 로딩/에러 상태 */}
            {relationsLoading && (
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                <span className="text-sm text-gray-600">
                  작품 정보 불러오는 중...
                </span>
              </div>
            )}

            {relationsError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {relationsError}
              </div>
            )}

            {/* RelationSelector — 2개 이상일 때 표시 (Requirements 3.7) */}
            {!relationsLoading && !relationsError && relations.length >= 2 && (
              <div className="mb-4">
                <RelationSelector
                  relations={relations}
                  selectedRelationId={selectedRelationId}
                  onSelect={setSelectedRelationId}
                />
              </div>
            )}

            {/* 씬 이미지 비교 (있는 경우) */}
            {effectiveSceneImageUrl && (
              <div className="mb-4">
                <p className="mb-2 text-sm font-medium text-gray-700">
                  참고 장면
                </p>
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={effectiveSceneImageUrl}
                    alt="참고 장면"
                    fill
                    sizes="(max-width: 768px) 50vw, 256px"
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* 인증샷 업로드 */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                인증샷 <span className="text-red-500">*</span>
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {photoPreview ? (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={photoPreview}
                    alt="인증샷 미리보기"
                    fill
                    sizes="(max-width: 768px) 50vw, 256px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null)
                      setPhotoUrl('')
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  {isUploading ? (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  ) : (
                    <>
                      <svg
                        className="mb-2 h-10 w-10 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span className="text-sm text-gray-500">사진 업로드</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 방문 날짜 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                방문 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* 코멘트 */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                한마디 (선택)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="순례 소감을 남겨주세요"
                maxLength={200}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {comment.length}/200
              </p>
            </div>

            {/* 백그라운드 업로드 상태 표시 */}
            {activeUploads.length > 0 && (
              <div className="mb-4 rounded-lg bg-blue-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="text-sm text-blue-700">
                    {activeUploads.length}개 파일 업로드 중...
                  </span>
                </div>
                {activeUploads.map((item) => (
                  <div key={item.id} className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                isUploading ||
                !photoUrl ||
                requiresRelationSelection ||
                !!relationsError
              }
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? '인증 중...' : '인증하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
