'use client'

/**
 * SwipeableGallery 컴포넌트
 * 좌우 스와이프로 이미지 탐색
 * - 터치 슬라이드 애니메이션
 * - 인디케이터 (현재 위치 표시)
 * - useSwipeGesture 훅 연동
 *
 * @requirements 2.2
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSwipeGesture } from '@/hooks/useSwipeGesture'
import { blurPlaceholderProps } from '@/lib/image-utils'

export interface SwipeableGalleryProps {
  /** 이미지 URL 배열 */
  images: string[]
  /** 현재 인덱스 변경 핸들러 */
  onIndexChange?: (index: number) => void
  /** 초기 인덱스 */
  initialIndex?: number
  /** 자동 재생 여부 */
  autoPlay?: boolean
  /** 자동 재생 간격 (ms) */
  autoPlayInterval?: number
}

const SWIPE_THRESHOLD = 50
const VELOCITY_THRESHOLD = 0.3

export default function SwipeableGallery({
  images,
  onIndexChange,
  initialIndex = 0,
  autoPlay = false,
  autoPlayInterval = 3000,
}: SwipeableGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [dragDeltaX, setDragDeltaX] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerWidthRef = useRef(0)
  const onIndexChangeRef = useRef(onIndexChange)
  onIndexChangeRef.current = onIndexChange

  // 컨테이너 너비 측정
  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerWidthRef.current = node.offsetWidth
    }
  }, [])

  const goToIndex = useCallback(
    (newIndex: number) => {
      if (newIndex < 0 || newIndex >= images.length) return
      setIsTransitioning(true)
      setDragDeltaX(0)
      setCurrentIndex(newIndex)
      onIndexChangeRef.current?.(newIndex)
    },
    [images.length]
  )

  // 스와이프 제스처 훅
  const { ref: swipeRef } = useSwipeGesture<HTMLDivElement>({
    threshold: SWIPE_THRESHOLD,
    velocityThreshold: VELOCITY_THRESHOLD,
    directions: ['left', 'right'],
    onSwiping: (deltaX) => {
      // 경계 체크: 첫 이미지에서 오른쪽, 마지막 이미지에서 왼쪽 스와이프 제한
      if (currentIndex === 0 && deltaX > 0) {
        setDragDeltaX(deltaX * 0.3) // 저항감
        return
      }
      if (currentIndex === images.length - 1 && deltaX < 0) {
        setDragDeltaX(deltaX * 0.3)
        return
      }
      setIsTransitioning(false)
      setDragDeltaX(deltaX)
    },
    onSwipe: (event) => {
      if (event.direction === 'left' && currentIndex < images.length - 1) {
        goToIndex(currentIndex + 1)
      } else if (event.direction === 'right' && currentIndex > 0) {
        goToIndex(currentIndex - 1)
      } else {
        // 스냅백
        setIsTransitioning(true)
        setDragDeltaX(0)
      }
    },
    onSwipeEnd: () => {
      // 임계값 미달 시 스냅백
      setIsTransitioning(true)
      setDragDeltaX(0)
    },
    disabled: images.length <= 1,
  })

  // 두 ref 병합
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      // swipeRef 설정
      ;(swipeRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node
      measureRef(node)
    },
    [swipeRef, measureRef]
  )

  // 자동 재생
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev < images.length - 1 ? prev + 1 : 0
        onIndexChangeRef.current?.(next)
        return next
      })
      setIsTransitioning(true)
      setDragDeltaX(0)
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [autoPlay, autoPlayInterval, images.length])

  // 트랜지션 종료 처리
  const handleTransitionEnd = useCallback(() => {
    setIsTransitioning(false)
  }, [])

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-gray-100 text-gray-400">
        이미지가 없습니다
      </div>
    )
  }

  const translateX =
    -currentIndex * 100 + (dragDeltaX / (containerWidthRef.current || 1)) * 100

  return (
    <div className="relative w-full overflow-hidden" ref={setRefs}>
      {/* 이미지 트랙 */}
      <div
        className="flex"
        style={{
          transform: `translateX(${translateX}%)`,
          transition: isTransitioning ? 'transform 300ms ease-out' : 'none',
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {images.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="aspect-[4/3] w-full flex-shrink-0"
          >
            <Image
              src={src}
              alt={`이미지 ${index + 1}`}
              width={800}
              height={600}
              className="h-full w-full object-cover"
              priority={index === 0}
              draggable={false}
              {...(index === 0 ? {} : blurPlaceholderProps)}
            />
          </div>
        ))}
      </div>

      {/* 인디케이터 */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-4 bg-white' : 'w-2 bg-white/50'
              }`}
              aria-label={`이미지 ${index + 1}로 이동`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      {/* 이미지 카운터 */}
      {images.length > 1 && (
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  )
}
