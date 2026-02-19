'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { UserBadge } from '@/types'

interface BadgeEarnedModalProps {
  badges: UserBadge[]
  onClose: () => void
}

/**
 * 뱃지 획득 축하 모달
 * Requirements: 4.4
 */
export function BadgeEarnedModal({ badges, onClose }: BadgeEarnedModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)

  const currentBadge = badges[currentIndex]

  useEffect(() => {
    // 애니메이션 시작
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [currentIndex])

  const handleNext = () => {
    if (currentIndex < badges.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onClose()
    }
  }

  if (badges.length === 0) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-yellow-400 to-orange-500 p-1">
        <div className="rounded-xl bg-white p-6 text-center">
          {/* 축하 텍스트 */}
          <div className="mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-800">뱃지 획득!</h2>

          {/* 뱃지 아이콘 (애니메이션) */}
          <div
            className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg transition-transform duration-500 ${
              isAnimating ? 'scale-0' : 'scale-100'
            }`}
          >
            {currentBadge?.badge?.iconUrl ? (
              <Image
                src={currentBadge.badge.iconUrl}
                alt={currentBadge.badge.name}
                width={56}
                height={56}
              />
            ) : (
              <svg
                className="h-12 w-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>

          {/* 뱃지 정보 */}
          <h3 className="mb-1 text-lg font-bold text-gray-800">
            {currentBadge?.badge?.name || '새로운 뱃지'}
          </h3>
          <p className="mb-6 text-sm text-gray-500">
            {currentBadge?.badge?.description || '축하합니다!'}
          </p>

          {/* 페이지 인디케이터 (여러 뱃지인 경우) */}
          {badges.length > 1 && (
            <div className="mb-4 flex justify-center gap-1">
              {badges.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentIndex ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 버튼 */}
          <button
            onClick={handleNext}
            className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            {currentIndex < badges.length - 1 ? '다음 뱃지 보기' : '확인'}
          </button>
        </div>

        {/* 반짝이 효과 */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 animate-ping rounded-full bg-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
