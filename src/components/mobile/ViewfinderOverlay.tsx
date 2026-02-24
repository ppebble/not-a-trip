'use client'

/**
 * ViewfinderOverlay 컴포넌트
 * 카메라 뷰파인더에 씬 이미지를 반투명 오버레이
 * - 카메라 스트림 표시 (video 태그)
 * - 씬 이미지 오버레이 (30~50% 투명도)
 * - 투명도 조절 슬라이더
 * - 촬영 버튼
 *
 * @requirements 3.4
 */

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { useCamera } from '@/hooks/useCamera'

interface ViewfinderOverlayProps {
  /** 오버레이할 씬 이미지 URL */
  sceneImageUrl: string
  /** 사진 촬영 핸들러 */
  onCapture: (imageBlob: Blob) => void
  /** 닫기 핸들러 */
  onClose: () => void
}

/** 투명도를 0.3~0.5 범위로 클램핑 */
function clampOpacity(value: number): number {
  return Math.max(0.3, Math.min(0.5, value))
}

export function ViewfinderOverlay({
  sceneImageUrl,
  onCapture,
  onClose,
}: ViewfinderOverlayProps) {
  const {
    videoRef,
    state,
    startCamera,
    stopCamera,
    switchCamera,
    capturePhoto,
  } = useCamera({ facingMode: 'environment' })
  const [opacity, setOpacity] = useState(0.4)
  const [showOverlay, setShowOverlay] = useState(true)
  const [isCapturing, setIsCapturing] = useState(false)

  // 카메라 시작 (마운트 시)
  const handleStartCamera = useCallback(async () => {
    await startCamera()
  }, [startCamera])

  // 촬영
  const handleCapture = useCallback(async () => {
    if (isCapturing) return
    setIsCapturing(true)
    try {
      const blob = await capturePhoto()
      if (blob) {
        onCapture(blob)
      }
    } finally {
      setIsCapturing(false)
    }
  }, [capturePhoto, onCapture, isCapturing])

  // 닫기
  const handleClose = useCallback(() => {
    stopCamera()
    onClose()
  }, [stopCamera, onClose])

  // 투명도 변경
  const handleOpacityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setOpacity(clampOpacity(parseFloat(e.target.value)))
    },
    []
  )

  // 카메라 미시작 상태
  if (!state.isCameraActive && !state.error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
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
        <button
          onClick={handleStartCamera}
          className="rounded-xl bg-blue-600 px-6 py-3 text-lg font-medium text-white"
        >
          카메라 시작
        </button>
        <p className="mt-3 text-sm text-gray-400">카메라 권한을 허용해주세요</p>
      </div>
    )
  }

  // 카메라 에러 상태
  if (state.error) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-6">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white"
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
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium text-white">
            {state.error.message}
          </p>
          <button
            onClick={handleClose}
            className="mt-4 rounded-lg bg-gray-700 px-4 py-2 text-white"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* 카메라 스트림 */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-full w-full object-cover"
      />

      {/* 씬 이미지 오버레이 */}
      {showOverlay && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ opacity }}
        >
          <Image
            src={sceneImageUrl}
            alt="씬 이미지 가이드"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* 상단 컨트롤 */}
      <div className="pb-safe absolute left-0 right-0 top-0 flex items-center justify-between p-4">
        <button
          onClick={handleClose}
          className="rounded-full bg-black/50 p-2 text-white"
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

        <div className="flex gap-2">
          {/* 오버레이 토글 */}
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`rounded-full p-2 ${showOverlay ? 'bg-blue-600' : 'bg-black/50'} text-white`}
            aria-label={showOverlay ? '오버레이 숨기기' : '오버레이 보기'}
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>

          {/* 카메라 전환 */}
          <button
            onClick={switchCamera}
            className="rounded-full bg-black/50 p-2 text-white"
            aria-label="카메라 전환"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 하단 컨트롤 */}
      <div className="pb-safe absolute bottom-0 left-0 right-0">
        {/* 투명도 슬라이더 */}
        {showOverlay && (
          <div className="mx-auto mb-4 flex w-64 items-center gap-3 px-4">
            <span className="text-xs text-white/70">30%</span>
            <input
              type="range"
              min="0.3"
              max="0.5"
              step="0.01"
              value={opacity}
              onChange={handleOpacityChange}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-blue-500"
              aria-label="오버레이 투명도 조절"
            />
            <span className="text-xs text-white/70">50%</span>
          </div>
        )}

        {/* 촬영 버튼 */}
        <div className="flex items-center justify-center pb-8">
          <button
            onClick={handleCapture}
            disabled={isCapturing}
            className="h-18 w-18 flex items-center justify-center rounded-full border-4 border-white bg-white/20 transition-transform active:scale-95 disabled:opacity-50"
            aria-label="사진 촬영"
          >
            <div className="h-14 w-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
