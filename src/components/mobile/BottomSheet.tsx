'use client'

import { useRouter } from 'next/navigation'
import { OptimizedImage } from '@/components/common/OptimizedImage'
import {
  useBottomSheetStore,
  useIsBottomSheetOpen,
  useBottomSheetSpotId,
  useBottomSheetHeight,
} from '@/stores/bottomSheetStore'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import { useSpotPreview } from '@/hooks/useSpots'
import { useMapStore } from '@/stores/mapStore'
import { useUIStore } from '@/stores/uiStore'

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
    close()
    useUIStore.getState().closePreview()
    useMapStore.getState().setSelectedSpot(null)
    router.push(`/spots/${spotId}`)
  }

  const displayHeight = isDragging
    ? currentSnapHeight - translateY
    : currentSnapHeight

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 z-[1000] rounded-t-2xl bg-white pb-safe-bottom pl-safe-left pr-safe-right text-neutral-900 shadow-2xl dark:border-t dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      style={{
        height: `${Math.max(0, displayHeight)}px`,
        transition: isDragging ? 'none' : 'height 0.3s ease-out',
      }}
      role="dialog"
      aria-label="스팟 정보"
    >
      <div
        data-drag-handle
        className="flex cursor-grab items-center justify-center py-3 active:cursor-grabbing"
      >
        <div className="h-1.5 w-10 rounded-full bg-muted" />
      </div>

      <div
        className="overflow-y-auto px-4"
        style={{ height: 'calc(100% - 40px)' }}
      >
        {isLoading && (
          <div className="flex h-20 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}

        {error && (
          <div className="flex h-20 flex-col items-center justify-center">
            <span className="text-2xl">!</span>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
              정보를 불러오지 못했습니다.
            </p>
          </div>
        )}

        {spot && !isLoading && !error && (
          <>
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                {spot.photoUrl ? (
                  <OptimizedImage
                    src={spot.photoUrl}
                    alt={spot.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-accent-surface dark:bg-neutral-800">
                    <span className="text-xl">📷</span>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-bold text-neutral-900 dark:text-neutral-100">
                  {spot.name}
                </h3>
                <p className="truncate text-sm text-neutral-600 dark:text-neutral-300">
                  {spot.address}
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetailClick}
                className="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-surface transition-colors hover:bg-primary-600"
                aria-label={`Open details for ${spot.name}`}
              >
                Details
              </button>
            </div>

            {(heightState === 'half' || heightState === 'full') && (
              <div className="mt-4">
                {spot.photoUrl && (
                  <div className="relative mb-3 h-48 w-full overflow-hidden rounded-xl">
                    <OptimizedImage
                      src={spot.photoUrl}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 384px"
                    />
                  </div>
                )}

                <p className="mb-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                  {spot.description}
                </p>

                <button
                  type="button"
                  onClick={handleDetailClick}
                  aria-label={`Open details for ${spot.name}`}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
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

            {heightState === 'full' && (
              <div className="mt-4 rounded-lg bg-accent-surface p-3 dark:bg-neutral-800">
                <div className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200">
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
