'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useStatusReport } from '@/hooks/useStatusReport'
import type { SpotStatus, CreateStatusReportInput } from '@/types/report'
import { API_ROUTES } from '@/lib/api-routes'

interface StatusReportFormProps {
  spotId: string
  onSuccess?: () => void
  onCancel?: () => void
}

const SPOT_STATUSES: {
  value: SpotStatus
  label: string
  icon: string
  description: string
}[] = [
  {
    value: 'normal',
    label: '정상',
    icon: '✅',
    description: '문제 없이 방문 가능',
  },
  {
    value: 'partially_changed',
    label: '일부 변경',
    icon: '🔄',
    description: '일부 모습이 변경됨',
  },
  {
    value: 'under_construction',
    label: '공사중',
    icon: '🚧',
    description: '현재 공사가 진행 중',
  },
  {
    value: 'demolished',
    label: '소실됨',
    icon: '🏚️',
    description: '건물/장소가 철거됨',
  },
  {
    value: 'inaccessible',
    label: '접근 불가',
    icon: '🚫',
    description: '출입이 제한된 상태',
  },
]

/**
 * 스팟 상태 신고 폼 컴포넌트
 * Requirements: 4.1, 4.2
 */
export function StatusReportForm({
  spotId,
  onSuccess,
  onCancel,
}: StatusReportFormProps) {
  const [selectedStatus, setSelectedStatus] = useState<SpotStatus | null>(null)
  const [description, setDescription] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const photoRef = useRef<HTMLInputElement>(null)

  const { mutate: submitReport, isPending } = useStatusReport(spotId)

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    setIsUploading(true)
    try {
      const url = await uploadImage(file)
      setPhotoUrl(url)
    } catch {
      setPhotoPreview(null)
      setPhotoUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = () => {
    setPhotoPreview(null)
    setPhotoUrl(null)
    if (photoRef.current) photoRef.current.value = ''
  }

  const handleSubmit = () => {
    if (!selectedStatus || !description.trim()) return

    const input: CreateStatusReportInput = {
      status: selectedStatus,
      description: description.trim(),
      photoUrl: photoUrl || undefined,
    }

    submitReport(input, {
      onSuccess: () => {
        setSuccess(true)
        onSuccess?.()
      },
    })
  }

  const canSubmit =
    selectedStatus && description.trim() && !isPending && !isUploading

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center">
        <p className="text-sm font-medium text-green-700">
          ✅ 상태 신고가 접수되었습니다
        </p>
        <p className="mt-1 text-xs text-green-600">
          검토 후 반영됩니다. 감사합니다!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 상태 선택 */}
      <div>
        <p className="text-navy-800 mb-2 text-sm font-medium">
          현재 상태 <span className="text-red-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SPOT_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setSelectedStatus(s.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                selectedStatus === s.value
                  ? 'border-navy-500 bg-navy-50'
                  : 'border-navy-100 hover:border-navy-300'
              }`}
            >
              <span className="text-lg">{s.icon}</span>
              <p className="text-navy-700 mt-1 text-xs font-medium">
                {s.label}
              </p>
              <p className="text-navy-400 text-[10px]">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 설명 입력 */}
      {selectedStatus && (
        <div>
          <label className="text-navy-800 mb-1 block text-sm font-medium">
            상세 설명 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="현재 상태에 대해 자세히 설명해주세요"
            rows={3}
            maxLength={500}
            className="border-navy-200 focus:border-navy-400 w-full rounded-md border px-3 py-2 text-sm focus:outline-none"
          />
          <p className="text-navy-400 mt-1 text-right text-xs">
            {description.length}/500
          </p>
        </div>
      )}

      {/* 사진 첨부 */}
      {selectedStatus && (
        <div>
          <label className="text-navy-700 mb-1 block text-xs font-medium">
            증거 사진 (선택)
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
                alt="증거 사진"
                fill
                sizes="128px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={removePhoto}
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
              className="border-navy-200 hover:border-navy-400 hover:bg-navy-50 flex aspect-video w-full max-w-xs flex-col items-center justify-center rounded-lg border-2 border-dashed"
            >
              {isUploading ? (
                <div className="border-navy-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <>
                  <svg
                    className="text-navy-300 mb-1 h-6 w-6"
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
                  <span className="text-navy-400 text-xs">사진 업로드</span>
                </>
              )}
            </button>
          )}
          {/* 사진 넛지 안내 */}
          <p className="mt-1.5 text-xs text-blue-600">
            💡 사진 증거를 첨부하면 더 빠르게 처리됩니다
          </p>
        </div>
      )}

      {/* 경고 문구 (심리적 허들) */}
      {selectedStatus && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          ⚠️ 허위 신고 시 서비스 이용이 제한될 수 있습니다
        </p>
      )}

      {/* 버튼 */}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="border-navy-200 text-navy-600 hover:bg-navy-50 flex-1 rounded-lg border py-2.5 text-sm font-medium transition-colors"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bg-navy-600 hover:bg-navy-700 flex-1 rounded-lg py-2.5 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? '제출 중...' : '상태 신고'}
        </button>
      </div>
    </div>
  )
}
