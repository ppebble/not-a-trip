'use client'

/**
 * BottomSheet 컴포넌트
 * 화면 하단에서 올라오는 UI 패널
 * - 드래그 핸들 UI
 * - 스냅 애니메이션 (collapsed/half/full)
 * - Safe Area 패딩 적용
 * - 스팟 미리보기 콘텐츠 렌더링
 *
 * @requirements 1.2, 1.3, 4.4
 */

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  useBottomSheetStore,
  useIsBottomSheetOpen,
  useBottomSheetSpotId,
  useBottomSheetHeight,
} from '@/stores/bottomSheetStore'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import { useSpotPreview } from '@/hooks/useSpots'

export default function BottomSheet() {
  const router = useRouter()
  const isOpen = useIsBottomSheetOpen()
  const spotId = useBottomSheetSpotId()
  const heightState = useBottomSheetHeight()
  const { close } = useBottomSheetStore()

  const { sheetRef, translateY, isDragging, currentSnapHeight } =
    useBottomSheet()

  const { data: spot, isLoading, error } = useSpotPreview(spotId)

  if (!isOpen || !spotId) return null

  const handleDetailClick = () => {
    router.push(`/spots/${spotId}`)
    close()
  }

  // 실제 표시 높이 계산 (드래그 중이면 translateY 반영)
  const displayHeight = isDragging
    ? currentSnapHeight - translateY
    : currentSnapHeight

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 z-[1000] rounded-t-2xl bg-white pb-safe-bottom pl-safe-left pr-safe-right shadow-2xl"
      style={{
        height: `${Math.max(0, displayHeight)}px`,
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
      }}
      role="dialog"
      aria-label="스팟 정보"
    >
      {/* 드래그 핸들 */}
      <div
        data-drag-handle
        className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
      >
        <div className="h-1.5 w-10 rounded-full bg-gray-300" />
      </div>

      {/* 콘텐츠 영역 */}
      <div
        className="overflow-y-auto px-4"
        style={{ height: 'calc(100% - 40px)' }}
      >
        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex h-20 items-center justify-center">
            <div className="border-navy-200 border-t-navy-600 h-6 w-6 animate-spin rounded-full border-2" />
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="flex h-20 flex-col items-center justify-center">
            <span className="text-2xl">😢</span>
            <p className="text-navy-600 mt-1 text-sm">
              정보를 불러올 수 없습니다
            </p>
          </div>
        )}

        {/* 스팟 미리보기 콘텐츠 */}
        {spot && !isLoading && !error && (
          <>
            {/* collapsed: 기본 정보만 */}
            <div className="flex items-center gap-3">
              {/* 썸네일 */}
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                {spot.photoUrl ? (
                  <Image
                    src={spot.photoUrl}
                    alt={spot.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="bg-navy-100 flex h-full w-full items-center justify-center">
                    <span className="text-xl">🗾</span>
                  </div>
                )}
              </div>

              {/* 이름 + 주소 */}
              <div className="min-w-0 flex-1">
                <h3 className="text-navy-800 truncate text-base font-bold">
                  {spot.name}
                </h3>
                <p className="text-navy-500 truncate text-sm">{spot.address}</p>
              </div>
            </div>

            {/* half/full: 추가 정보 */}
            {(heightState === 'half' || heightState === 'full') && (
              <div className="mt-4">
                {/* 큰 이미지 */}
                {spot.photoUrl && (
                  <div className="relative mb-3 h-48 w-full overflow-hidden rounded-xl">
                    <Image
                      src={spot.photoUrl}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                )}

                {/* 설명 */}
                <p className="text-navy-700 mb-4 text-sm leading-relaxed">
                  {spot.description}
                </p>

                {/* 상세보기 버튼 */}
                <button
                  onClick={handleDetailClick}
                  className="bg-navy-600 hover:bg-navy-700 flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors"
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
            )}

            {/* full: 주소 상세 */}
            {heightState === 'full' && (
              <div className="bg-navy-50 mt-4 rounded-lg p-3">
                <div className="text-navy-600 flex items-start gap-2 text-sm">
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
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
