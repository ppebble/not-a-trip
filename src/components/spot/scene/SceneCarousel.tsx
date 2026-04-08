'use client'

import { useState, useCallback, useEffect } from 'react'
import { Scene } from '@/types'
import { SceneCard } from './SceneCard'

interface SceneCarouselProps {
  scenes: Scene[]
  onLike: (sceneId: string) => void
  isLiking: boolean
  onSceneClick: (index: number) => void
}

/**
 * 캐러셀 컴포넌트 - 2개씩 큰 카드 표시
 */
export function SceneCarousel({
  scenes,
  onLike,
  isLiking,
  onSceneClick,
}: SceneCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  useEffect(() => {
    const updateItemsPerView = () => {
      setItemsPerView(window.innerWidth >= 640 ? 2 : 1)
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const totalSlides = Math.ceil(scenes.length / itemsPerView)
  const maxIndex = Math.max(0, totalSlides - 1)

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
  }, [maxIndex])

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
  }, [maxIndex])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [currentIndex, maxIndex])

  const startIdx = currentIndex * itemsPerView
  const visibleScenes = scenes.slice(startIdx, startIdx + itemsPerView)

  if (scenes.length === 0) return null

  return (
    <div className="relative px-2">
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {visibleScenes.map((scene, idx) => (
            <SceneCard
              key={scene.id}
              scene={scene}
              onLike={onLike}
              isLiking={isLiking}
              onClick={() => onSceneClick(startIdx + idx)}
            />
          ))}
        </div>
      </div>

      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="absolute -left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface shadow-lg transition-all hover:bg-surface hover:shadow-xl dark:bg-neutral-800"
            aria-label="이전 장면"
          >
            <svg
              className="h-6 w-6 text-secondary"
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
          <button
            onClick={goToNext}
            className="absolute -right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface shadow-lg transition-all hover:bg-surface hover:shadow-xl dark:bg-neutral-800"
            aria-label="다음 장면"
          >
            <svg
              className="h-6 w-6 text-secondary"
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
        </>
      )}

      {totalSlides > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`${index + 1}번째 슬라이드로 이동`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
