'use client'

import { useEffect, useRef, useCallback } from 'react'
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
 * 스팟 핀 클릭 시 표시되는 미리보기 팝업입니다.
 *
 * Requirements:
 * - 2.2: 스팟 이름, 사진, 설명, 주소 표시
 * - 2.3: 외부 클릭 시 팝업 닫기
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

  // 외부 클릭 시 팝업 닫기 (Requirements 2.3)
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        previewRef.current &&
        !previewRef.current.contains(event.target as Node)
      ) {
        closePreview()
      }
    },
    [closePreview]
  )

  // ESC 키로 팝업 닫기
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePreview()
      }
    },
    [closePreview]
  )

  useEffect(() => {
    if (isPreviewOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPreviewOpen, handleClickOutside, handleKeyDown])

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
      className={`fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spot-preview-title"
    >
      <div
        ref={previewRef}
        className="animate-fade-in-up mx-4 w-full max-w-md rounded-2xl bg-white shadow-2xl"
      >
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-navy-200 border-t-navy-600"></div>
              <p className="mt-3 text-sm text-navy-600">스팟 정보 로딩 중...</p>
            </div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex h-64 flex-col items-center justify-center p-6">
            <div className="mb-3 text-4xl">😢</div>
            <p className="text-center text-navy-600">
              스팟 정보를 불러오는데 실패했습니다.
            </p>
            <button
              onClick={closePreview}
              className="mt-4 rounded-lg bg-navy-600 px-4 py-2 text-sm text-white hover:bg-navy-700"
            >
              닫기
            </button>
          </div>
        )}

        {/* 스팟 미리보기 콘텐츠 (Requirements 2.2) */}
        {spot && !isLoading && !error && (
          <>
            {/* 닫기 버튼 */}
            <button
              onClick={closePreview}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              aria-label="닫기"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* 스팟 사진 */}
            <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
              {spot.photoUrl ? (
                <Image
                  src={spot.photoUrl}
                  alt={spot.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 400px"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-navy-100">
                  <span className="text-4xl">🗾</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

              {/* 배지 */}
              <div className="absolute bottom-3 left-3">
                <span className="inline-flex items-center rounded-full bg-navy-600/90 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  📍 특별한 여행지
                </span>
              </div>
            </div>

            {/* 스팟 정보 */}
            <div className="p-5">
              {/* 스팟 이름 */}
              <h2
                id="spot-preview-title"
                className="mb-2 text-xl font-bold text-navy-800"
              >
                {spot.name}
              </h2>

              {/* 스팟 주소 */}
              <div className="mb-3 flex items-start space-x-2 text-sm text-navy-600">
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
                <span>{spot.address}</span>
              </div>

              {/* 스팟 설명 */}
              <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-navy-700">
                {spot.description}
              </p>

              {/* 액션 버튼 영역 */}
              <div className="flex items-center justify-between border-t border-navy-100 pt-4">
                <div className="flex space-x-3">
                  <button
                    className="flex items-center space-x-1 text-sm text-navy-500 transition-colors hover:text-navy-700"
                    aria-label="좋아요"
                  >
                    <span>❤️</span>
                    <span>좋아요</span>
                  </button>
                  <button
                    className="flex items-center space-x-1 text-sm text-navy-500 transition-colors hover:text-navy-700"
                    aria-label="공유하기"
                  >
                    <span>🔗</span>
                    <span>공유</span>
                  </button>
                </div>

                {/* 상세보기 버튼 (Requirements 2.4) */}
                <button
                  onClick={handleDetailClick}
                  className="flex items-center space-x-2 rounded-lg bg-navy-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-navy-700"
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
