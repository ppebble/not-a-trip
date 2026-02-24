'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CheckInModal } from './CheckInModal'
import { QuickCheckIn } from './QuickCheckIn'
import { LoginRequiredModal } from '@/components/common'
import { UserBadge } from '@/types'

interface CheckInButtonProps {
  spotId: string
  spotName: string
  sceneImageUrl?: string
  onSuccess?: (earnedBadges?: UserBadge[]) => void
  className?: string
}

/**
 * 순례 인증 버튼 컴포넌트
 * 모바일: QuickCheckIn (3단계 빠른 플로우)
 * 데스크탑: 기존 CheckInModal
 *
 * Requirements: 1.1, 3.1, 3.2, 3.3, 3.4
 */
export function CheckInButton({
  spotId,
  spotName,
  sceneImageUrl,
  onSuccess,
  className = '',
}: CheckInButtonProps) {
  const { data: session } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleClick = () => {
    if (!session?.user) {
      setShowLoginModal(true)
      return
    }
    setIsModalOpen(true)
  }

  const handleSuccess = (earnedBadges?: UserBadge[]) => {
    setIsModalOpen(false)
    onSuccess?.(earnedBadges)
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 ${className}`}
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
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        순례 인증
      </button>

      {/* 모바일: QuickCheckIn / 데스크탑: CheckInModal */}
      {isModalOpen &&
        (isMobile ? (
          <QuickCheckIn
            spotId={spotId}
            spotName={spotName}
            sceneImageUrl={sceneImageUrl}
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleSuccess}
          />
        ) : (
          <CheckInModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            spotId={spotId}
            spotName={spotName}
            sceneImageUrl={sceneImageUrl}
            onSuccess={handleSuccess}
          />
        ))}

      <LoginRequiredModal
        isOpen={showLoginModal}
        onConfirm={() => setShowLoginModal(false)}
        description="순례 인증을 하려면 로그인이 필요합니다."
      />
    </>
  )
}
