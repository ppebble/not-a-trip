'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Scene } from '@/types'
import { useLikedSceneIds } from '@/stores/likeStore'

interface SceneImageModalProps {
  scenes: Scene[]
  initialIndex: number
  onClose: () => void
  onLike: (sceneId: string) => void
}

/**
 * 장면 이미지 전체보기 모달 컴포넌트
 * - 마우스 스크롤로 확대/축소
 * - 더블클릭으로 좋아요
 * - 좌우 화살표로 다른 장면 탐색
 * - ESC 또는 배경 클릭으로 닫기
 */
export default function SceneImageModal({
  scenes,
  initialIndex,
  onClose,
  onLike,
}: SceneImageModalProps) {
  // likeStore에서 직접 참조
  const likedSceneIds = useLikedSceneIds()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [scale, setScale] = useState(1)
  const [showLikeAnimation, setShowLikeAnimation] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const currentScene = scenes[currentIndex]
  const isLiked = likedSceneIds.has(currentScene.id)

  // 이전 장면으로 이동
  const goToPrev = useCallback(() => {
    setScale(1)
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : scenes.length - 1))
  }, [scenes.length])

  // 다음 장면으로 이동
  const goToNext = useCallback(() => {
    setScale(1)
    setCurrentIndex((prev) => (prev < scenes.length - 1 ? prev + 1 : 0))
  }, [scenes.length])

  // 좋아요 처리 (토글 방식)
  const handleLike = useCallback(() => {
    // 좋아요 추가 시에만 애니메이션 표시 (취소 시에는 표시 안 함)
    if (!isLiked) {
      setShowLikeAnimation(true)
      setTimeout(() => setShowLikeAnimation(false), 1000)
    }
    onLike(currentScene.id)
  }, [currentScene.id, isLiked, onLike])

  // 더블클릭으로 좋아요
  const handleDoubleClick = useCallback(() => {
    handleLike()
  }, [handleLike])

  // 마우스 휠로 확대/축소
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setScale((prev) => Math.min(Math.max(prev + delta, 1), 3))
  }, [])

  // 휠 이벤트 등록
  useEffect(() => {
    const container = imageContainerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      return () => container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])

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
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, goToPrev, goToNext])

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

      {/* 좋아요 버튼 */}
      <button
        onClick={handleLike}
        className={`absolute right-4 top-16 z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          isLiked
            ? 'bg-red-500 text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
        aria-label={isLiked ? '좋아요 취소' : '좋아요'}
      >
        <svg
          className="h-5 w-5"
          fill={isLiked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

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
        ref={imageContainerRef}
        className="relative flex h-[80vh] w-[90vw] max-w-5xl items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
      >
        {/* 좋아요 애니메이션 */}
        {showLikeAnimation && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <svg
              className="h-24 w-24 animate-ping text-red-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        )}

        <div
          className="relative h-full w-full transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
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

          {/* 조작 안내 */}
          <p className="mt-2 text-xs text-white/50">
            스크롤: 확대/축소 · 더블클릭: 좋아요 · ←→: 이동
          </p>

          {/* 인디케이터 */}
          {scenes.length > 1 && (
            <div className="mt-3 flex justify-center gap-2">
              {scenes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setScale(1)
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
