'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { LoginRequiredModal } from '@/components/common'

export interface FloatingActionButtonProps {
  onClick: () => void
  label?: string // default: "+ 순례 인증하기"
  'data-tour'?: string
}

/**
 * 플로팅 액션 버튼 컴포넌트
 * 갤러리 페이지에서 순례 인증을 시작하는 버튼입니다.
 *
 * Requirements: 4.1, 4.6
 * - 4.1: THE Gallery_System SHALL display a floating "+ 순례 인증하기" button
 * - 4.6: IF a user is not authenticated, THEN redirect to login page
 */
export function FloatingActionButton({
  onClick,
  label = '+ 순례 인증하기',
  'data-tour': dataTour,
}: FloatingActionButtonProps) {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleClick = () => {
    if (!session?.user) {
      setShowLoginModal(true)
      return
    }
    onClick()
  }

  return (
    <>
      <button
        onClick={handleClick}
        data-tour={dataTour}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-primary-700 hover:shadow-xl active:scale-95"
        aria-label={label}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
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
        <span>{label}</span>
      </button>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onConfirm={() => setShowLoginModal(false)}
        description="순례 인증을 하려면 로그인이 필요합니다."
      />
    </>
  )
}
