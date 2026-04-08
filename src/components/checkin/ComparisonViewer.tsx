'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface ComparisonViewerProps {
  sceneImageUrl: string
  userPhotoUrl: string
  mode?: 'slider' | 'side-by-side'
  className?: string
}

/**
 * 씬 비교 뷰어 컴포넌트
 * Requirements: 2.1, 2.2, 2.3
 */
export function ComparisonViewer({
  sceneImageUrl,
  userPhotoUrl,
  mode: initialMode = 'slider',
  className = '',
}: ComparisonViewerProps) {
  const [mode, setMode] = useState(initialMode)
  const [sliderPosition, setSliderPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updateSliderPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return
    updateSliderPosition(e.clientX)
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true
    updateSliderPosition(e.touches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return
    updateSliderPosition(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  if (mode === 'side-by-side') {
    return (
      <div className={`${className}`}>
        {/* 모드 전환 버튼 */}
        <div className="mb-2 flex justify-end">
          <button
            onClick={() => setMode('slider')}
            className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
          >
            슬라이더 모드
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={sceneImageUrl}
              alt="작품 속 장면"
              fill
              sizes="(max-width: 768px) 50vw, 384px"
              className="object-cover"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
              작품 속 장면
            </span>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={userPhotoUrl}
              alt="인증샷"
              fill
              sizes="(max-width: 768px) 50vw, 384px"
              className="object-cover"
            />
            <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
              인증샷
            </span>
          </div>
        </div>
      </div>
    )
  }

  // 슬라이더 모드
  return (
    <div className={`${className}`}>
      {/* 모드 전환 버튼 */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => setMode('side-by-side')}
          className="rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
        >
          나란히 보기
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative aspect-video cursor-ew-resize select-none overflow-hidden rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 인증샷 (뒤) */}
        <div className="absolute inset-0">
          <Image
            src={userPhotoUrl}
            alt="인증샷"
            fill
            sizes="(max-width: 768px) 50vw, 384px"
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* 작품 속 장면 (앞, 클리핑) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full"
            style={{ width: `${100 / (sliderPosition / 100)}%` }}
          >
            <Image
              src={sceneImageUrl}
              alt="작품 속 장면"
              fill
              sizes="(max-width: 768px) 50vw, 384px"
              className="object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* 슬라이더 핸들 */}
        <div
          className="absolute bottom-0 top-0 w-1 bg-surface shadow-lg"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface p-2 shadow-lg">
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>

        {/* 라벨 */}
        <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          작품 속 장면
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
          인증샷
        </span>
      </div>

      <p className="mt-2 text-center text-xs text-gray-500">
        드래그하여 비교해보세요
      </p>
    </div>
  )
}
