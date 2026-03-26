'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import type { EvidencePair } from '@/types/report'

interface EvidencePairUploadProps {
  pairs: EvidencePair[]
  onChange: (pairs: EvidencePair[]) => void
  maxPairs?: number
}

interface PairState {
  captureImageUrl: string
  capturePreview: string | null
  realPhotoUrl: string
  realPhotoPreview: string | null
  description: string
  isUploadingCapture: boolean
  isUploadingReal: boolean
}

const EMPTY_PAIR: PairState = {
  captureImageUrl: '',
  capturePreview: null,
  realPhotoUrl: '',
  realPhotoPreview: null,
  description: '',
  isUploadingCapture: false,
  isUploadingReal: false,
}

/**
 * 증거 사진 쌍 업로드 컴포넌트
 * 애니메이션 캡처 + 현장 사진을 쌍으로 업로드
 * Requirements: 1.2
 */
export function EvidencePairUpload({
  pairs,
  onChange,
  maxPairs = 5,
}: EvidencePairUploadProps) {
  const [pairStates, setPairStates] = useState<PairState[]>(() =>
    pairs.length > 0
      ? pairs.map((p) => ({
          ...EMPTY_PAIR,
          captureImageUrl: p.captureImageUrl,
          capturePreview: p.captureImageUrl,
          realPhotoUrl: p.realPhotoUrl,
          realPhotoPreview: p.realPhotoUrl,
          description: p.description || '',
        }))
      : [{ ...EMPTY_PAIR }]
  )

  const captureRefs = useRef<(HTMLInputElement | null)[]>([])
  const realRefs = useRef<(HTMLInputElement | null)[]>([])

  const syncToParent = (states: PairState[]) => {
    const completePairs: EvidencePair[] = states
      .filter((s) => s.captureImageUrl && s.realPhotoUrl)
      .map((s) => ({
        captureImageUrl: s.captureImageUrl,
        realPhotoUrl: s.realPhotoUrl,
        description: s.description || undefined,
      }))
    onChange(completePairs)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('업로드 실패')
    const data = await res.json()
    return data.imageUrl
  }

  const handleFileChange = async (
    index: number,
    type: 'capture' | 'real',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 미리보기 생성
    const reader = new FileReader()
    reader.onload = (ev) => {
      setPairStates((prev) => {
        const next = [...prev]
        if (type === 'capture') {
          next[index] = {
            ...next[index],
            capturePreview: ev.target?.result as string,
          }
        } else {
          next[index] = {
            ...next[index],
            realPhotoPreview: ev.target?.result as string,
          }
        }
        return next
      })
    }
    reader.readAsDataURL(file)

    // 업로드 상태 설정
    setPairStates((prev) => {
      const next = [...prev]
      if (type === 'capture') {
        next[index] = { ...next[index], isUploadingCapture: true }
      } else {
        next[index] = { ...next[index], isUploadingReal: true }
      }
      return next
    })

    try {
      const imageUrl = await uploadImage(file)
      setPairStates((prev) => {
        const next = [...prev]
        if (type === 'capture') {
          next[index] = {
            ...next[index],
            captureImageUrl: imageUrl,
            isUploadingCapture: false,
          }
        } else {
          next[index] = {
            ...next[index],
            realPhotoUrl: imageUrl,
            isUploadingReal: false,
          }
        }
        syncToParent(next)
        return next
      })
    } catch {
      setPairStates((prev) => {
        const next = [...prev]
        if (type === 'capture') {
          next[index] = {
            ...next[index],
            capturePreview: null,
            captureImageUrl: '',
            isUploadingCapture: false,
          }
        } else {
          next[index] = {
            ...next[index],
            realPhotoPreview: null,
            realPhotoUrl: '',
            isUploadingReal: false,
          }
        }
        return next
      })
    }
  }

  const handleRemoveImage = (index: number, type: 'capture' | 'real') => {
    setPairStates((prev) => {
      const next = [...prev]
      if (type === 'capture') {
        next[index] = {
          ...next[index],
          captureImageUrl: '',
          capturePreview: null,
        }
        if (captureRefs.current[index]) captureRefs.current[index]!.value = ''
      } else {
        next[index] = {
          ...next[index],
          realPhotoUrl: '',
          realPhotoPreview: null,
        }
        if (realRefs.current[index]) realRefs.current[index]!.value = ''
      }
      syncToParent(next)
      return next
    })
  }

  const handleDescriptionChange = (index: number, value: string) => {
    setPairStates((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], description: value }
      syncToParent(next)
      return next
    })
  }

  const addPair = () => {
    if (pairStates.length >= maxPairs) return
    setPairStates((prev) => [...prev, { ...EMPTY_PAIR }])
  }

  const removePair = (index: number) => {
    if (pairStates.length <= 1) return
    setPairStates((prev) => {
      const next = prev.filter((_, i) => i !== index)
      syncToParent(next)
      return next
    })
  }

  const isAnyUploading = pairStates.some(
    (s) => s.isUploadingCapture || s.isUploadingReal
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-primary">
          증거 사진 쌍 <span className="text-red-500">*</span>
        </p>
        <span className="text-xs text-muted">
          {pairStates.length}/{maxPairs}쌍
        </span>
      </div>
      <p className="text-xs text-muted">
        작품 속 캡처 이미지와 실제 현장 사진을 쌍으로 등록해주세요
      </p>

      {pairStates.map((pair, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-primary-50/30 p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-secondary">
              사진 쌍 {index + 1}
            </span>
            {pairStates.length > 1 && (
              <button
                type="button"
                onClick={() => removePair(index)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                삭제
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 캡처 이미지 */}
            <div>
              <p className="mb-1 text-xs text-secondary">🎬 작품 캡처</p>
              <input
                ref={(el) => {
                  captureRefs.current[index] = el
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(index, 'capture', e)}
                className="hidden"
              />
              {pair.capturePreview ? (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={pair.capturePreview}
                    alt="작품 캡처"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, 'capture')}
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
                  onClick={() => captureRefs.current[index]?.click()}
                  disabled={pair.isUploadingCapture}
                  className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-neutral-300 hover:bg-surface"
                >
                  {pair.isUploadingCapture ? (
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
                      <span className="text-[10px] text-muted">
                        캡처 업로드
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* 현장 사진 */}
            <div>
              <p className="mb-1 text-xs text-secondary">📸 현장 사진</p>
              <input
                ref={(el) => {
                  realRefs.current[index] = el
                }}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(index, 'real', e)}
                className="hidden"
              />
              {pair.realPhotoPreview ? (
                <div className="relative aspect-video overflow-hidden rounded-lg">
                  <Image
                    src={pair.realPhotoPreview}
                    alt="현장 사진"
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index, 'real')}
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
                  onClick={() => realRefs.current[index]?.click()}
                  disabled={pair.isUploadingReal}
                  className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-neutral-300 hover:bg-surface"
                >
                  {pair.isUploadingReal ? (
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
                      <span className="text-[10px] text-muted">
                        현장 업로드
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 설명 입력 */}
          <input
            type="text"
            value={pair.description}
            onChange={(e) => handleDescriptionChange(index, e.target.value)}
            placeholder="설명 (선택)"
            maxLength={100}
            className="mt-2 w-full rounded-md border border-border px-2 py-1.5 text-xs focus:border-primary focus:outline-none"
          />

          {/* 쌍 완성 상태 표시 */}
          {pair.captureImageUrl && pair.realPhotoUrl ? (
            <p className="mt-1 text-xs text-green-600">✓ 쌍 완성</p>
          ) : (
            <p className="mt-1 text-xs text-amber-500">
              {!pair.captureImageUrl && !pair.realPhotoUrl
                ? '캡처와 현장 사진을 모두 등록해주세요'
                : !pair.captureImageUrl
                  ? '작품 캡처를 등록해주세요'
                  : '현장 사진을 등록해주세요'}
            </p>
          )}
        </div>
      ))}

      {/* 쌍 추가 버튼 */}
      {pairStates.length < maxPairs && (
        <button
          type="button"
          onClick={addPair}
          disabled={isAnyUploading}
          className="w-full rounded-lg border border-dashed border-border py-2 text-sm text-secondary hover:border-neutral-300 hover:bg-surface disabled:opacity-50"
        >
          + 사진 쌍 추가
        </button>
      )}
    </div>
  )
}
