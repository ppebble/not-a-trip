'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { LoginRequiredModal } from '@/components/common'
import { API_ROUTES } from '@/lib/api-routes'

interface MicroVoteButtonProps {
  facilityId: string
  /** 현재 유저의 기존 투표 값 (null = 미투표) */
  currentVote?: boolean | null
  onVoteComplete?: (result: {
    verificationScore: number
    upvotes: number
    downvotes: number
  }) => void
}

/**
 * 마이크로 투표 버튼 컴포넌트
 *
 * "이 정보가 정확한가요?" 텍스트와 👍/👎 버튼을 렌더링합니다.
 * - 로그인 유저: 투표 API 호출
 * - 비로그인 유저: 로그인 유도 모달 표시
 * - 이미 투표한 경우: 선택 상태 하이라이트
 *
 * Requirements: 5.10, 7.6
 */
export default function MicroVoteButton({
  facilityId,
  currentVote = null,
  onVoteComplete,
}: MicroVoteButtonProps) {
  const { data: session } = useSession()
  const [vote, setVote] = useState<boolean | null>(currentVote)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleVote = async (value: boolean) => {
    if (!session?.user) {
      setShowLoginModal(true)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(API_ROUTES.FACILITIES.VOTE(facilityId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      })

      if (!res.ok) {
        throw new Error('투표에 실패했습니다')
      }

      const result = await res.json()
      setVote(value)
      onVoteComplete?.(result)
    } catch {
      // 조용히 실패 — 유저에게 재시도 가능하도록 상태 유지
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="mt-3 flex items-center gap-2 border-t border-neutral-100 pt-3">
        <span className="text-xs text-secondary">이 정보가 정확한가요?</span>
        <div className="flex gap-1">
          <button
            onClick={() => handleVote(true)}
            disabled={isLoading}
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              vote === true
                ? 'bg-green-100 text-green-700 ring-1 ring-green-300'
                : 'bg-surface text-secondary hover:bg-green-50 hover:text-green-600'
            } disabled:opacity-50`}
            aria-label="정확해요"
            aria-pressed={vote === true}
          >
            👍 정확해요
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isLoading}
            className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              vote === false
                ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                : 'bg-surface text-secondary hover:bg-red-50 hover:text-red-600'
            } disabled:opacity-50`}
            aria-label="아니에요"
            aria-pressed={vote === false}
          >
            👎 아니에요
          </button>
        </div>
      </div>

      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        description="투표하려면 로그인이 필요합니다."
      />
    </>
  )
}
