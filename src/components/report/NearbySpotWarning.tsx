'use client'

import Image from 'next/image'
import type { NearbyItem } from '@/hooks/useNearbyCheck'

interface NearbySpotWarningProps {
  nearbyItems: NearbyItem[]
  isLoading: boolean
  onContinue: () => void
  onSelectSpot: (spotId: string) => void
}

/**
 * 50m 이내 기존 스팟 경고 컴포넌트
 * Requirements: 1.3
 */
export function NearbySpotWarning({
  nearbyItems,
  isLoading,
  onContinue,
  onSelectSpot,
}: NearbySpotWarningProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-primary-50 p-4">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-primary">주변 스팟 검색 중...</span>
      </div>
    )
  }

  if (nearbyItems.length === 0) return null

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-start gap-2">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-800">
            반경 50m 이내에 {nearbyItems.length}개의 스팟이 있습니다
          </p>
          <p className="mt-1 text-xs text-amber-600">
            이미 등록된 스팟이라면 정보 보완을 이용해주세요
          </p>
        </div>
      </div>

      {/* 근처 스팟 목록 */}
      <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
        {nearbyItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => item.type === 'spot' && onSelectSpot(item.id)}
            className="flex w-full items-center gap-3 rounded-md bg-white p-2 text-left transition-colors hover:bg-amber-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
          >
            {item.thumbnailUrl ? (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-surface text-lg">
                📍
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-primary-800">
                {item.name}
              </p>
              <p className="text-xs text-muted">
                {Math.round(item.distance)}m ·{' '}
                {item.type === 'spot' ? '등록된 스팟' : '대기중 제보'}
              </p>
            </div>
            {item.type === 'spot' && (
              <span className="text-xs text-muted">보완 →</span>
            )}
          </button>
        ))}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 rounded-lg border border-amber-300 bg-white py-2 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
        >
          계속 진행
        </button>
      </div>
    </div>
  )
}
