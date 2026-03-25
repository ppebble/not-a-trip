'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { SupplementType, CreateSupplementInput } from '@/types/report'
import { API_ROUTES } from '@/lib/api-routes'

interface SupplementFormProps {
  spotId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const SUPPLEMENT_TYPES: {
  value: SupplementType
  label: string
  icon: string
  description: string
}[] = [
  {
    value: 'scene_info',
    label: '씬 정보',
    icon: '🎬',
    description: '작품명, 에피소드, 캡처 이미지 추가',
  },
  {
    value: 'description',
    label: '설명 보완',
    icon: '📝',
    description: '장소 설명이나 방문 팁 추가',
  },
  {
    value: 'photo',
    label: '사진 추가',
    icon: '📸',
    description: '씬 비교 사진이나 대표 사진 추가',
  },
  {
    value: 'other',
    label: '기타',
    icon: '💡',
    description: '기타 정보 보완',
  },
]

/**
 * 기존 스팟 정보 보완 제보 폼
 * Requirements: 3.1, 3.2
 */
export function SupplementForm({
  spotId,
  onSuccess,
  onCancel,
}: SupplementFormProps) {
  const [type, setType] = useState<SupplementType | null>(null)
  const [content, setContent] = useState('')
  const [animeTitle, setAnimeTitle] = useState('')
  const [episodeInfo, setEpisodeInfo] = useState('')
  const [captureImageUrl, setCaptureImageUrl] = useState('')
  const [capturePreview, setCapturePreview] = useState<string | null>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const captureRef = useRef<HTMLInputElement>(null)
  const photoRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(API_ROUTES.UPLOAD, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) throw new Error('업로드 실패')
    const data = await res.json()
    return data.imageUrl
  }

  const handleCaptureUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setCapturePreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const url = await uploadImage(file)
      setCaptureImageUrl(url)
    } catch {
      setCapturePreview(null)
      setCaptureImageUrl('')
    } finally {
      setIsUploading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const url = await uploadImage(file)
      setPhotos([url])
    } catch {
      setPhotoPreview(null)
      setPhotos([])
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!type || !content.trim()) return

    if (type === 'scene_info' && !animeTitle.trim()) {
      setError('작품명을 입력해주세요')
      return
    }

    setIsSubmitting(true)
    setError(null)

    const input: CreateSupplementInput = {
      type,
      content: content.trim(),
      ...(type === 'scene_info' && {
        sceneInfo: {
          animeTitle: animeTitle.trim(),
          episodeInfo: episodeInfo.trim() || undefined,
          captureImageUrl: captureImageUrl || undefined,
        },
      }),
      ...(photos.length > 0 && { photos }),
    }

    try {
      const res = await fetch(API_ROUTES.SUPPLEMENTS.BASE(spotId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '제보에 실패했습니다')
      }

      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : '제보에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    type &&
    content.trim() &&
    !isSubmitting &&
    !isUploading &&
    (type !== 'scene_info' || animeTitle.trim())

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-700">
          ✅ 정보 보완 제보가 접수되었습니다
        </p>
        <p className="mt-1 text-xs text-green-600">
          검토 후 반영됩니다. 감사합니다!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 보완 유형 선택 */}
      <div>
        <p className="mb-2 text-sm font-medium text-primary-800">
          보완 유형 <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SUPPLEMENT_TYPES.map((st) => (
            <button
              key={st.value}
              type="button"
              onClick={() => setType(st.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                type === st.value
                  ? 'border-primary bg-primary-50'
                  : 'border-border hover:border-neutral-300'
              }`}
            >
              <span className="text-lg">{st.icon}</span>
              <p className="mt-1 text-xs font-medium text-secondary">
                {st.label}
              </p>
              <p className="text-[10px] text-muted">{st.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* scene_info 전용 필드 */}
      {type === 'scene_info' && (
        <div className="space-y-3 rounded-lg border border-border bg-primary-50/30 p-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              작품명 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={animeTitle}
              onChange={(e) => setAnimeTitle(e.target.value)}
              placeholder="예: 너의 이름은"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              에피소드/타임스탬프
            </label>
            <input
              type="text"
              value={episodeInfo}
              onChange={(e) => setEpisodeInfo(e.target.value)}
              placeholder="예: 1화 12:30"
              className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              캡처 이미지
            </label>
            <input
              ref={captureRef}
              type="file"
              accept="image/*"
              onChange={handleCaptureUpload}
              className="hidden"
            />
            {capturePreview ? (
              <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg">
                <Image
                  src={capturePreview}
                  alt="캡처 이미지"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCapturePreview(null)
                    setCaptureImageUrl('')
                    if (captureRef.current) captureRef.current.value = ''
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
                >
                  <svg
                    className="h-4 w-4"
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
                onClick={() => captureRef.current?.click()}
                disabled={isUploading}
                className="flex aspect-video w-full max-w-xs flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary-400 hover:bg-surface"
              >
                {isUploading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <>
                    <svg
                      className="mb-1 h-6 w-6 text-neutral-300"
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
                    <span className="text-xs text-muted">
                      캡처 이미지 업로드
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* photo 타입 전용 사진 업로드 */}
      {type === 'photo' && (
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">
            사진 첨부
          </label>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {photoPreview ? (
            <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg">
              <Image
                src={photoPreview}
                alt="첨부 사진"
                fill
                sizes="128px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setPhotoPreview(null)
                  setPhotos([])
                  if (photoRef.current) photoRef.current.value = ''
                }}
                className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white hover:bg-black/70"
              >
                <svg
                  className="h-4 w-4"
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
              onClick={() => photoRef.current?.click()}
              disabled={isUploading}
              className="flex aspect-video w-full max-w-xs flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary-400 hover:bg-surface"
            >
              {isUploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <svg
                    className="mb-1 h-6 w-6 text-neutral-300"
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
                  <span className="text-xs text-muted">사진 업로드</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 보완 내용 */}
      {type && (
        <div>
          <label className="mb-1 block text-sm font-medium text-primary-800">
            보완 내용 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              type === 'scene_info'
                ? '해당 장면에 대한 설명을 입력해주세요'
                : type === 'description'
                  ? '보완할 설명이나 방문 팁을 입력해주세요'
                  : type === 'photo'
                    ? '사진에 대한 설명을 입력해주세요'
                    : '보완할 내용을 입력해주세요'
            }
            rows={3}
            maxLength={500}
            className="w-full rounded-md border border-border px-3 py-2 text-sm focus:border-primary-400 focus:outline-none"
          />
          <p className="mt-1 text-right text-xs text-muted">
            {content.length}/500
          </p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* 버튼 */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? '제출 중...' : '정보 보완 제출'}
        </button>
      </div>
    </div>
  )
}
