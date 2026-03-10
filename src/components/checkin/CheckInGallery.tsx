'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckIn } from '@/types'
import { useCheckInGallery } from '@/hooks/useGalleryQueries'
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
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)

  const { data, isLoading } = useCheckInGallery(
    spotId,
    userId,
    sortBy,
    page,
    limit
  )

  // 페이지 변경 시 누적 데이터 관리
  const checkins =
    page === 1
      ? (data?.checkins ?? [])
      : [...allCheckins, ...(data?.checkins ?? [])]
  const total = data?.total ?? 0

  const handleLoadMore = () => {
    setAllCheckins(checkins)
    setPage((p) => p + 1)
  }

  const handleSortChange = (newSort: 'latest' | 'popular') => {
    setSortBy(newSort)
    setPage(1)
    setAllCheckins([])
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading && checkins.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-lg bg-gray-200"
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
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => handleSortChange('popular')}
            className={`rounded-lg px-3 py-1 text-sm ${
              sortBy === 'popular'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            인기순
          </button>
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {checkins.map((checkin) => (
          <button
            key={checkin.id}
            onClick={() => setSelectedCheckIn(checkin)}
            className="group relative aspect-square overflow-hidden rounded-lg"
          >
            <Image
              src={checkin.photoUrl}
              alt={`${checkin.userName}의 인증샷`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
          onClose={() => setSelectedCheckIn(null)}
        />
      )}
    </div>
  )
}
