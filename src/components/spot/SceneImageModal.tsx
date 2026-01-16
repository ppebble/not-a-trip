'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Scene } from '@/types'

interface SceneImageModalProps {
  scenes: Scene[]
  initialIndex: number
  onClose: () => void
}

/**
 * 장면 이미지 전체보기 모달 컴포넌트
 * - 이미지 확대/축소 기능
 * - 좌우 화살표로 다른 장면 탐색
 * - ESC 또는 배경 클릭으로 닫기
 */
export default function SceneImageModal({
  scenes,
  initialIndex,
  onClose,
}: SceneImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentScene = scenes[currentIndex]

  // 이전 장면으로 이동
  const goToPrev = useCallback(() => {
    setScale(1)
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : scenes.length - 1))
  }, [scenes.length])

  // 다음 장면으로 이동
  const goToNext = useCallback(() => {
    setScale(1)
    setIsZoomed(false)
    setCurrentIndex((prev) => (prev < scenes.length - 1 ? prev + 1 : 0))
  }, [scenes.length])

  // 확대/축소 토글
  const toggleZoom = useCallback(() => {
    if (isZoomed) {
      setScale(1)
      setIsZoomed(false)
    } else {
      setScale(2)
      setIsZoomed(true)
    }
  }, [isZoomed])

  // 확대
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 3))
    setIsZoomed(true)
  }, [])

  // 축소
  const zoomOut = useCallback(() => {
    const newScale = Math.max(scale - 0.5, 1)
    setScale(newScale)
    if (newScale === 1) {
      setIsZoomed(false)
    }
  }, [scale])

  // 키보드 이벤트 핸들링
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose()
          break
        case 'ArrowLeft':
          goToPrev()
          break
        case 'ArrowRight':
          goToNext()
          break
        case '+':
        case '=':
          zoomIn()
          break
        case '-':
          zoomOut()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // 모달 열릴 때 스크롤 방지
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, goToPrev, goToNext, zoomIn, zoomOut])

  // 배경 클릭 시 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="장면 이미지 전체보기"
    >
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="닫기"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* 확대/축소 컨트롤 */}
      <div className="absolute right-4 top-16 z-10 flex flex-col gap-2">
        <button
          onClick={zoomIn}
          disabled={scale >= 3}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          aria-label="확대"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          disabled={scale <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-50"
          aria-label="축소"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </button>
        <button
          onClick={toggleZoom}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label={isZoomed ? '원본 크기' : '확대'}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isZoomed ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
              />
            )}
          </svg>
        </button>
      </div>

      {/* 좌측 화살표 */}
      {scenes.length > 1 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="이전 장면"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* 우측 화살표 */}
      {scenes.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="다음 장면"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {/* 이미지 컨테이너 */}
      <div
        className="relative flex h-[80vh] w-[90vw] max-w-5xl items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative h-full w-full transition-transform duration-200"
          style={{
            transform: `scale(${scale})`,
            cursor: isZoomed ? 'zoom-out' : 'zoom-in',
          }}
          onClick={toggleZoom}
        >
          <Image
            src={currentScene.imageUrl}
            alt={currentScene.episodeInfo || '장면 이미지'}
            fill
            className="object-contain"
            sizes="90vw"
            priority
          />
        </div>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
        <div className="mx-auto max-w-3xl text-center text-white">
          {currentScene.episodeInfo && (
            <h3 className="mb-2 text-lg font-semibold">
              {currentScene.episodeInfo}
            </h3>
          )}
          {currentScene.description && (
            <p className="text-sm text-white/80">{currentScene.description}</p>
          )}
          {/* 인디케이터 */}
          {scenes.length > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {scenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setScale(1)
                    setIsZoomed(false)
                    setCurrentIndex(index)
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-6 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`${index + 1}번째 장면으로 이동`}
                />
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-white/60">
            {currentIndex + 1} / {scenes.length}
          </p>
        </div>
      </div>
    </div>
  )
}
