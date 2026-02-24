'use client'

/**
 * QuickCheckIn 컴포넌트
 * 3단계 빠른 인증 플로우 (사진 선택 → 코멘트 → 완료)
 * - 카메라/갤러리 선택 옵션
 * - 이미지 압축 적용
 * - 백그라운드 업로드 연동
 *
 * @requirements 3.1, 3.2, 3.3
 */

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { ViewfinderOverlay } from '@/components/mobile/ViewfinderOverlay'
import { CheckInInput, UserBadge } from '@/types'

type Step = 'photo' | 'comment' | 'complete'

interface QuickCheckInProps {
  /** 스팟 ID */
  spotId: string
  /** 스팟 이름 */
  spotName: string
  /** 씬 이미지 URL (뷰파인더 오버레이용) */
  sceneImageUrl?: string
  /** 닫기 핸들러 */
  onClose: () => void
  /** 인증 성공 콜백 */
  onSuccess?: (earnedBadges?: UserBadge[]) => void
}

export function QuickCheckIn({
  spotId,
  spotName,
  sceneImageUrl,
  onClose,
  onSuccess,
}: QuickCheckInProps) {
  const [step, setStep] = useState<Step>('photo')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [comment, setComment] = useState('')
  const [showViewfinder, setShowViewfinder] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 파일 선택 처리
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPhotoPreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
      setStep('comment')
      setError(null)
    },
    []
  )

  // 뷰파인더 촬영 처리
  const handleViewfinderCapture = useCallback((blob: Blob) => {
    const file = new File([blob], `checkin-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(blob))
    setShowViewfinder(false)
    setStep('comment')
    setError(null)
  }, [])

  // 인증 제출
  const handleSubmit = useCallback(async () => {
    if (!photoFile) return
    setIsSubmitting(true)
    setError(null)

    try {
      // 1. 이미지 업로드
      const formData = new FormData()
      formData.append('file', photoFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('이미지 업로드 실패')
      const uploadData = await uploadRes.json()

      // 2. 인증 생성
      const input: CheckInInput = {
        spotId,
        photoUrl: uploadData.imageUrl,
        sceneImageUrl,
        visitedAt: new Date(),
        comment: comment.trim() || undefined,
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
      setStep('complete')
      onSuccess?.(data.earnedBadges)
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }, [photoFile, spotId, sceneImageUrl, comment, onSuccess])

  // 사진 다시 선택
  const handleRetakePhoto = useCallback(() => {
    setPhotoPreview(null)
    setPhotoFile(null)
    setStep('photo')
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  // 뷰파인더 모드
  if (showViewfinder && sceneImageUrl) {
    return (
      <ViewfinderOverlay
        sceneImageUrl={sceneImageUrl}
        onCapture={handleViewfinderCapture}
        onClose={() => setShowViewfinder(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-lg rounded-t-2xl bg-white sm:rounded-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-lg font-bold">순례 인증</h2>
            <p className="text-sm text-gray-500">{spotName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="닫기"
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

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2 px-4 pt-3">
          {(['photo', 'comment', 'complete'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                  step === s
                    ? 'bg-blue-600 text-white'
                    : i < ['photo', 'comment', 'complete'].indexOf(step)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`h-0.5 w-8 ${
                    i < ['photo', 'comment', 'complete'].indexOf(step)
                      ? 'bg-blue-300'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-4">
          {/* Step 1: 사진 선택 */}
          {step === 'photo' && (
            <div className="space-y-3">
              <p className="text-center text-sm text-gray-600">
                인증샷을 선택해주세요
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="grid grid-cols-2 gap-3">
                {/* 카메라 촬영 */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50"
                >
                  <svg
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-600">
                    카메라 / 갤러리
                  </span>
                </button>

                {/* 뷰파인더 오버레이 (씬 이미지가 있을 때만) */}
                {sceneImageUrl ? (
                  <button
                    onClick={() => setShowViewfinder(true)}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <svg
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      구도 가이드
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.removeAttribute('capture')
                        fileInputRef.current.click()
                      }
                    }}
                    className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-6 transition-colors hover:border-blue-500 hover:bg-blue-50"
                  >
                    <svg
                      className="h-10 w-10 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      갤러리
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 코멘트 */}
          {step === 'comment' && (
            <div className="space-y-4">
              {/* 사진 미리보기 */}
              {photoPreview && (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={photoPreview}
                    alt="인증샷 미리보기"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="absolute right-2 top-2 rounded-full bg-black/50 px-3 py-1 text-xs text-white"
                  >
                    다시 선택
                  </button>
                </div>
              )}

              {/* 코멘트 입력 */}
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="순례 소감을 남겨주세요 (선택)"
                  maxLength={200}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-right text-xs text-gray-400">
                  {comment.length}/200
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetakePhoto}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-700"
                >
                  이전
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-medium text-white disabled:bg-gray-300"
                >
                  {isSubmitting ? '인증 중...' : '인증하기'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 완료 */}
          {step === 'complete' && (
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
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white"
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
