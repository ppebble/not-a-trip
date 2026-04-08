'use client'

import Image from 'next/image'
import { CheckIn } from '@/types'
import { AppIcon } from '@/components/common/AppIcon'
import { ComparisonViewer } from './ComparisonViewer'

interface CheckInDetailModalProps {
  checkIn: CheckIn
  onClose: () => void
}

/**
 * 인증 상세 모달
 */
export function CheckInDetailModal({
  checkIn,
  onClose,
}: CheckInDetailModalProps) {
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
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white dark:bg-neutral-800"
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
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-secondary-50">
                <AppIcon name="profile-front" size={36} />
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
                sizes="(max-width: 768px) 100vw, 672px"
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
