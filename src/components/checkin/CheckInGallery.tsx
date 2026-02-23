'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { CheckIn } from '@/types'
import { ComparisonViewer } from './ComparisonViewer'

interface CheckInGalleryProps {
  spotId?: string
  userId?: string
  limit?: number
  showLoadMore?: boolean
  className?: string
}

/**
 * 인증샷 갤러리 컴포넌트
 * Requirements: 1.5, 5.3
 */
export function CheckInGallery({
  spotId,
  userId,
  limit = 12,
  showLoadMore = true,
  className = '',
}: CheckInGalleryProps) {
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'latest' | 'popular'>('latest')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null)

  const fetchCheckins = async (pageNum: number, append = false) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        sortBy,
      })
      if (spotId) params.set('spotId', spotId)
      if (userId) params.set('userId', userId)

      const res = await fetch(`/api/checkins?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()

      if (append) {
        setCheckins((prev) => [...prev, ...data.checkins])
      } else {
        setCheckins(data.checkins)
      }
      setTotal(data.total)
    } catch (error) {
      console.error('Error fetching checkins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    fetchCheckins(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotId, userId, sortBy, limit])

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchCheckins(nextPage, true)
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
            onClick={() => setSortBy('latest')}
            className={`rounded-lg px-3 py-1 text-sm ${
              sortBy === 'latest'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortBy('popular')}
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

/**
 * 인증 상세 모달
 */
function CheckInDetailModal({
  checkIn,
  onClose,
}: {
  checkIn: CheckIn
  onClose: () => void
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            {checkIn.userImage ? (
              <Image
                src={checkIn.userImage}
                alt={checkIn.userName}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <span className="text-lg font-medium text-gray-600">
                  {checkIn.userName[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">{checkIn.userName}</p>
              <p className="text-sm text-gray-500">
                {formatDate(checkIn.visitedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 이미지 */}
        <div className="p-4">
          {checkIn.sceneImageUrl ? (
            <ComparisonViewer
              sceneImageUrl={checkIn.sceneImageUrl}
              userPhotoUrl={checkIn.photoUrl}
            />
          ) : (
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src={checkIn.photoUrl}
                alt="인증샷"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        {/* 코멘트 */}
        {checkIn.comment && (
          <div className="border-t px-4 py-3">
            <p className="text-gray-700">{checkIn.comment}</p>
          </div>
        )}

        {/* 좋아요 */}
        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-1 text-gray-500">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm">{checkIn.likeCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
