'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { getSafeImageSrc } from '@/lib/safe-image-src'
import { CheckIn, CheckInLikeStatus } from '@/types'
import { useCheckInGallery } from '@/hooks/useGalleryQueries'
import { API_ROUTES } from '@/lib/api-routes'
import { getDeviceId } from '@/lib/device-id'
import { CheckInDetailModal } from './CheckInDetailModal'

interface CheckInGalleryProps {
  spotId?: string
  userId?: string
  limit?: number
  showLoadMore?: boolean
  className?: string
}

/**
 * 인증샷 갤러리 컴포넌트
 * Requirements: 1.5, 5.3, 8.3
 */
export function CheckInGallery({
  spotId,
  userId,
  limit = 12,
  showLoadMore = true,
  className = '',
}: CheckInGalleryProps) {
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [allCheckins, setAllCheckins] = useState<CheckIn[]>([])
  const [checkInOverrides, setCheckInOverrides] = useState<
    Record<string, Partial<CheckIn>>
  >({})
  const [likedByViewer, setLikedByViewer] = useState<Record<string, boolean>>(
    {}
  )
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)

  const { data, isLoading } = useCheckInGallery(
    spotId,
    userId,
    sortBy,
    page,
    limit
  )

  // 페이지 변경 시 누적 데이터 관리
  const fetchedCheckins =
    page === 1
      ? (data?.checkins ?? [])
      : [...allCheckins, ...(data?.checkins ?? [])]
  const checkins = fetchedCheckins.map((checkin) => ({
    ...checkin,
    ...checkInOverrides[checkin.id],
  }))
  const total = data?.total ?? 0
  const visibleCheckInIds = checkins.map((checkin) => checkin.id).join('|')

  useEffect(() => {
    if (!visibleCheckInIds || typeof fetch === 'undefined') return

    let cancelled = false
    const deviceId = getDeviceId()
    const headers = deviceId ? { 'X-Device-Id': deviceId } : undefined

    const fetchLikeStatuses = async () => {
      const visibleIds = visibleCheckInIds.split('|').filter(Boolean)
      const missingIds = visibleIds.filter(
        (id) => likedByViewer[id] === undefined
      )
      if (missingIds.length === 0) return

      const entries = await Promise.all(
        missingIds.map(async (id) => {
          try {
            const response = await fetch(API_ROUTES.CHECKINS.LIKE(id), {
              headers,
            })
            if (!response.ok) return [id, false] as const

            const body: CheckInLikeStatus = await response.json()
            return [id, body.liked] as const
          } catch {
            return [id, false] as const
          }
        })
      )

      if (cancelled) return

      setLikedByViewer((current) => ({
        ...current,
        ...Object.fromEntries(entries),
      }))
    }

    fetchLikeStatuses()

    return () => {
      cancelled = true
    }
  }, [likedByViewer, visibleCheckInIds])

  const handleLoadMore = () => {
    setAllCheckins(checkins)
    setPage((p) => p + 1)
  }

  const handleSortChange = (newSort: 'latest' | 'popular') => {
    setSortBy(newSort)
    setPage(1)
    setAllCheckins([])
  }

  const handleCheckInUpdated = (updatedCheckIn: CheckIn, liked?: boolean) => {
    setCheckInOverrides((current) => ({
      ...current,
      [updatedCheckIn.id]: {
        likeCount: updatedCheckIn.likeCount,
        updatedAt: updatedCheckIn.updatedAt,
      },
    }))
    if (liked !== undefined) {
      setLikedByViewer((current) => ({
        ...current,
        [updatedCheckIn.id]: liked,
      }))
    }
    setSelectedCheckIn(updatedCheckIn)
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const isFewItems = (count: number) => count >= 1 && count <= 3

  if (isLoading && checkins.length === 0) {
    return (
      <div className={`${className}`}>
        <div
          className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4${isFewItems(limit) ? 'justify-items-start' : ''}`}
        >
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square animate-pulse rounded-lg bg-gray-200${isFewItems(limit) ? 'max-w-[200px]' : ''}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (checkins.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <svg
          className="mx-auto mb-4 h-12 w-12 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
        </svg>
        <p className="text-gray-500">아직 인증샷이 없습니다</p>
        <p className="mt-1 text-sm text-gray-400">
          첫 번째 순례자가 되어보세요!
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* 정렬 옵션 */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">총 {total}개의 인증</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleSortChange('latest')}
            className={`rounded-lg px-3 py-1 text-sm ${
              sortBy === 'latest'
                ? 'bg-primary-100 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`rounded-lg px-3 py-1 text-sm ${
              sortBy === 'popular'
                ? 'bg-primary-100 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div
        className={`grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4${isFewItems(checkins.length) ? 'justify-items-start' : ''}`}
      >
        {checkins.map((checkin) => (
          <button
            key={checkin.id}
            onClick={() => setSelectedCheckIn(checkin)}
            className={`group relative aspect-square overflow-hidden rounded-lg${isFewItems(checkins.length) ? 'max-w-[200px]' : ''}`}
          >
            <Image
              src={getSafeImageSrc(checkin.photoUrl)}
              alt={`${checkin.userName}의 인증샷`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <svg
                data-testid={`checkin-like-indicator-${checkin.id}`}
                data-liked={likedByViewer[checkin.id] ? 'true' : 'false'}
                className={
                  likedByViewer[checkin.id]
                    ? 'h-4 w-4 text-red-400'
                    : 'h-4 w-4 text-white'
                }
                fill={likedByViewer[checkin.id] ? 'currentColor' : 'none'}
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span className="text-xs font-medium">{checkin.likeCount}</span>
              <span className="sr-only">
                {likedByViewer[checkin.id]
                  ? '내가 좋아요를 누른 인증'
                  : '내가 좋아요를 누르지 않은 인증'}
              </span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <p className="truncate text-sm font-medium">{checkin.userName}</p>
              <p className="text-xs opacity-80">
                {formatDate(checkin.visitedAt)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* 더보기 버튼 */}
      {showLoadMore && checkins.length < total && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="rounded-lg bg-gray-100 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {isLoading ? '로딩 중...' : '더보기'}
          </button>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedCheckIn && (
        <CheckInDetailModal
          checkIn={selectedCheckIn}
          onCheckInUpdated={handleCheckInUpdated}
          onClose={() => setSelectedCheckIn(null)}
        />
      )}
    </div>
  )
}
