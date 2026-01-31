'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useUIStore,
  useIsPreviewOpen,
  usePreviewSpotId,
} from '@/stores/uiStore'
import { useSpotPreview } from '@/hooks/useSpots'

interface SpotPreviewProps {
  className?: string
}

/**
 * SpotPreview 컴포넌트
 *
 * 스팟 핀 호버 시 표시되는 미리보기 툴팁입니다.
 * 지도 우측 하단에 고정되어 표시됩니다.
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
  const { closePreview } = useUIStore()

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

  return (
    <div
      ref={previewRef}
      className={`animate-fade-in-up absolute bottom-4 right-4 z-[900] w-80 rounded-xl bg-white shadow-xl ${className}`}
      role="tooltip"
      aria-labelledby="spot-preview-title"
      onMouseEnter={(e) => e.stopPropagation()}
    >
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex h-32 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-navy-200 border-t-navy-600"></div>
            <p className="mt-2 text-xs text-navy-600">로딩 중...</p>
          </div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="flex h-32 flex-col items-center justify-center p-4">
          <div className="mb-2 text-2xl">😢</div>
          <p className="text-center text-sm text-navy-600">
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
            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
            aria-label="닫기"
          >
            <svg
              className="h-3.5 w-3.5"
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
          <div className="relative h-32 w-full overflow-hidden rounded-t-xl">
            {spot.photoUrl ? (
              <Image
                src={spot.photoUrl}
                alt={spot.name}
                fill
                className="object-cover"
                sizes="320px"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-navy-100">
                <span className="text-3xl">🗾</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* 스팟 정보 */}
          <div className="p-3">
            {/* 스팟 이름 */}
            <h2
              id="spot-preview-title"
              className="mb-1 truncate text-base font-bold text-navy-800"
            >
              {spot.name}
            </h2>

            {/* 스팟 주소 */}
            <div className="mb-2 flex items-start space-x-1 text-xs text-navy-600">
              <svg
                className="mt-0.5 h-3 w-3 flex-shrink-0"
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
            <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-navy-700">
              {spot.description}
            </p>

            {/* 상세보기 버튼 (Requirements 2.4) */}
            <button
              onClick={handleDetailClick}
              className="flex w-full items-center justify-center space-x-1 rounded-lg bg-navy-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-navy-700"
            >
              <span>자세히 보기</span>
              <svg
                className="h-3 w-3"
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
