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

// 툴팁 크기 상수
const TOOLTIP_WIDTH = 384 // w-96
const TOOLTIP_HEIGHT = 340 // 대략적인 높이

/**
 * SpotPreview 컴포넌트
 *
 * 스팟 핀 호버 시 표시되는 미리보기 툴팁입니다.
 * 핀 위치 근처에 동적으로 표시됩니다.
 *
 * Requirements:
 * - 2.2: 스팟 이름, 사진, 설명, 주소 표시
 * - 2.4: 상세보기 버튼으로 Spot_Detail 페이지 이동
 */
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

  // 스팟 미리보기 데이터 조회
  const { data: spot, isLoading, error } = useSpotPreview(previewSpotId)

  // 상세 페이지로 이동 (Requirements 2.4)
  const handleDetailClick = () => {
    if (previewSpotId) {
      router.push(`/spots/${previewSpotId}`)
    }
  }

  // 팝업이 닫혀있으면 렌더링하지 않음
  if (!isPreviewOpen || !previewSpotId) {
    return null
  }

  // 툴팁 위치 계산 (핀 오른쪽에 표시, 화면 밖으로 나가면 조정)
  const calculatePosition = () => {
    if (!previewPosition) {
      return { left: 16, top: 100 } // 기본 위치
    }

    const { x, y } = previewPosition
    const padding = 16
    const pinOffset = 30 // 핀에서 떨어진 거리

    // 부모 컨테이너 크기 (지도 컨테이너)
    const containerWidth =
      previewRef.current?.parentElement?.clientWidth || window.innerWidth
    const containerHeight =
      previewRef.current?.parentElement?.clientHeight || window.innerHeight

    // 기본: 핀 오른쪽에 표시
    let left = x + pinOffset
    let top = y - TOOLTIP_HEIGHT / 2

    // 오른쪽 화면 밖으로 나가면 왼쪽에 표시
    if (left + TOOLTIP_WIDTH > containerWidth - padding) {
      left = x - TOOLTIP_WIDTH - pinOffset
    }

    // 왼쪽 화면 밖으로 나가면 최소 padding 유지
    if (left < padding) {
      left = padding
    }

    // 위쪽 화면 밖으로 나가면 조정
    if (top < padding) {
      top = padding
    }

    // 아래쪽 화면 밖으로 나가면 조정
    if (top + TOOLTIP_HEIGHT > containerHeight - padding) {
      top = containerHeight - TOOLTIP_HEIGHT - padding
    }

    return { left, top }
  }

  const position = calculatePosition()

  return (
    <div
      ref={previewRef}
      className={`animate-fade-in-up absolute z-[900] w-96 rounded-xl bg-white shadow-xl ${className}`}
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
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex h-40 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"></div>
            <p className="mt-2 text-sm text-primary">로딩 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="flex h-40 flex-col items-center justify-center p-4">
          <div className="mb-2 text-3xl">😢</div>
          <p className="text-center text-sm text-primary">
            정보를 불러올 수 없습니다
          </p>
        </div>
      )}

      {/* 스팟 미리보기 콘텐츠 (Requirements 2.2) */}
      {spot && !isLoading && !error && (
        <>
          {/* 닫기 버튼 */}
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

          {/* 스팟 사진 */}
          <div className="relative h-44 w-full overflow-hidden rounded-t-xl">
            {spot.photoUrl ? (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                fill
                className="object-cover"
                sizes="384px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface">
                <span className="text-4xl">🗾</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* 스팟 정보 */}
          <div className="p-4">
            {/* 스팟 이름 */}
            <h2
              id="spot-preview-title"
              className="mb-2 truncate text-lg font-bold text-primary-800"
            >
              {spot.name}
            </h2>

            {/* 스팟 주소 */}
            <div className="mb-2 flex items-start space-x-1.5 text-sm text-primary">
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

            {/* 스팟 설명 */}
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-text-secondary">
              {spot.description}
            </p>

            {/* 상세보기 버튼 (Requirements 2.4) */}
            <button
              onClick={handleDetailClick}
              className="flex w-full items-center justify-center space-x-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
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
