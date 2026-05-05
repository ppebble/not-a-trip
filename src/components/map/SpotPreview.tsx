'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useShallow } from 'zustand/react/shallow'
import {
  useUIStore,
  useIsPreviewOpen,
  usePreviewSpotId,
  usePreviewPosition,
} from '@/stores/uiStore'
import { useSpotPreview } from '@/hooks/useSpots'

interface SpotPreviewProps {
  className?: string
}

const TOOLTIP_WIDTH = 384
const TOOLTIP_HEIGHT = 340

export default function SpotPreview({ className = '' }: SpotPreviewProps) {
  const router = useRouter()
  const previewRef = useRef<HTMLDivElement>(null)

  const isPreviewOpen = useIsPreviewOpen()
  const previewSpotId = usePreviewSpotId()
  const previewPosition = usePreviewPosition()
  const { closePreview, setPreviewHovered } = useUIStore(
    useShallow((state) => ({
      closePreview: state.closePreview,
      setPreviewHovered: state.setPreviewHovered,
    }))
  )

  const { data: spot, isLoading, error } = useSpotPreview(previewSpotId)

  const handleDetailClick = () => {
    if (previewSpotId) {
      router.push(`/spots/${previewSpotId}`)
    }
  }

  if (!isPreviewOpen || !previewSpotId) {
    return null
  }

  const calculatePosition = () => {
    if (!previewPosition) {
      return { left: 16, top: 100 }
    }

    const { x, y } = previewPosition
    const padding = 16
    const pinOffset = 30

    const containerWidth =
      previewRef.current?.parentElement?.clientWidth || window.innerWidth
    const containerHeight =
      previewRef.current?.parentElement?.clientHeight || window.innerHeight

    let left = x + pinOffset
    let top = y - TOOLTIP_HEIGHT / 2

    if (left + TOOLTIP_WIDTH > containerWidth - padding) {
      left = x - TOOLTIP_WIDTH - pinOffset
    }

    if (left < padding) {
      left = padding
    }

    if (top < padding) {
      top = padding
    }

    if (top + TOOLTIP_HEIGHT > containerHeight - padding) {
      top = containerHeight - TOOLTIP_HEIGHT - padding
    }

    return { left, top }
  }

  const position = calculatePosition()

  return (
    <div
      ref={previewRef}
      className={`animate-fade-in-up absolute z-[900] w-96 rounded-xl border border-border bg-surface text-main-text shadow-xl ${className}`}
      style={{
        left: position.left,
        top: position.top,
      }}
      role="tooltip"
      aria-labelledby="spot-preview-title"
      onMouseEnter={() => setPreviewHovered(true)}
      onMouseLeave={() => {
        setPreviewHovered(false)
        closePreview()
      }}
    >
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary dark:border-neutral-700"></div>
            <p className="mt-2 text-sm text-primary">불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex h-40 flex-col items-center justify-center p-4">
          <div className="mb-2 text-3xl">!</div>
          <p className="text-center text-sm text-primary">
            정보를 불러오지 못했습니다.
          </p>
        </div>
      )}

      {spot && !isLoading && !error && (
        <>
          <button
            onClick={closePreview}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="닫기"
          >
            <svg
              className="h-4 w-4"
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

          <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
            {spot.photoUrl ? (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                fill
                className="object-cover"
                sizes="384px"
                priority
                unoptimized={spot.photoUrl.startsWith('http')}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-accent-surface">
                <span className="text-4xl">📷</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div className="p-4">
            <h2
              id="spot-preview-title"
              className="mb-2 truncate text-lg font-bold text-main-text"
            >
              {spot.name}
            </h2>

            <div className="mb-2 flex items-start space-x-1.5 text-sm text-sub-text">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="line-clamp-1">{spot.address}</span>
            </div>

            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-sub-text">
              {spot.description}
            </p>

            <button
              onClick={handleDetailClick}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-600"
            >
              <span>자세히 보기</span>
              <svg
                className="h-4 w-4"
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
          </div>
        </>
      )}
    </div>
  )
}
