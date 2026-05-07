'use client'

/**
 * InlineCheckInSheet - 코스 진행 중 인라인 인증 바텀시트
 *
 * 코스 진행 중 페이지 이탈 없이 QuickCheckIn 플로우를 바텀시트로 제공한다.
 * QuickCheckIn 컴포넌트를 내부에 렌더링하고, 인증 완료 후 완료 애니메이션을
 * 표시한 뒤 1.5초 후 자동으로 닫힌다.
 *
 * 구현 방식:
 * - QuickCheckIn은 자체 fixed 오버레이를 가지므로, InlineCheckInSheet는
 *   QuickCheckIn의 onSuccess 콜백을 래핑하여 완료 처리를 담당한다.
 * - 완료 상태(isCompleted)에서는 QuickCheckIn 대신 완료 뷰를 표시한다.
 *
 * @requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.2, 2.5
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { QuickCheckIn } from '@/components/checkin/QuickCheckIn'
import type { UserBadge } from '@/types'

export interface InlineCheckInSheetProps {
  /** 인증할 스팟 ID */
  spotId: string
  /** 스팟 이름 (헤더 표시용) */
  spotName: string
  /** 코스 내 스팟 순서 (1-based, 헤더 표시용) */
  spotIndex: number
  /** 시트 열림 상태 */
  isOpen: boolean
  /** 닫기 핸들러 */
  onClose: () => void
  /** 인증 완료 콜백 */
  onComplete: (spotId: string) => void
}

/**
 * InlineCheckInSheet
 *
 * isOpen이 false이면 null 반환 (DOM에서 제거).
 * QuickCheckIn 컴포넌트를 렌더링하고 onSuccess 콜백에서:
 *   1. onComplete(spotId) 호출 → 부모에서 Store 업데이트
 *   2. 완료 애니메이션 표시
 *   3. 1500ms 대기 후 onClose() 호출
 */
export function InlineCheckInSheet({
  spotId,
  spotName,
  spotIndex,
  isOpen,
  onClose,
  onComplete,
}: InlineCheckInSheetProps) {
  const [isCompleted, setIsCompleted] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // isOpen이 변경될 때 상태 초기화
  useEffect(() => {
    if (isOpen) {
      setIsCompleted(false)
    }
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [isOpen])

  /** QuickCheckIn 인증 성공 콜백 */
  const handleCheckInSuccess = useCallback(
    (_earnedBadges?: UserBadge[]) => {
      // 1. 부모에서 Store 업데이트
      onComplete(spotId)
      // 2. 완료 애니메이션 표시
      setIsCompleted(true)
      // 3. 1.5초 후 자동 닫힘
      closeTimerRef.current = setTimeout(() => {
        onClose()
      }, 1500)
    },
    [spotId, onComplete, onClose]
  )

  // isOpen이 false이면 DOM에서 제거
  if (!isOpen) return null

  // 완료 상태: 완료 뷰 표시 (fixed 오버레이)
  if (isCompleted) {
    return (
      <div className="fixed inset-0 z-50">
        {/* 배경 오버레이 */}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

        {/* 완료 시트 */}
        <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white shadow-xl">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                {spotIndex}번
              </span>
              <span className="max-w-[200px] truncate text-sm font-semibold text-gray-900">
                {spotName}
              </span>
            </div>
            {/* 완료 중에는 닫기 버튼 비활성화 */}
            <button
              disabled
              className="cursor-not-allowed rounded-full p-1.5 text-gray-400 opacity-40"
              aria-label="닫기"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 완료 애니메이션 뷰 */}
          <div className="flex flex-col items-center justify-center px-4 py-10">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-9 w-9 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">인증 완료!</h3>
            <p className="mt-1 text-sm text-gray-500">
              {spotIndex}번 스팟 인증이 완료되었습니다
            </p>
            <p className="mt-3 text-xs text-gray-400">
              잠시 후 자동으로 닫힙니다...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 인증 플로우: QuickCheckIn 렌더링
  // QuickCheckIn은 자체 fixed inset-0 z-50 오버레이를 포함하므로
  // 별도 오버레이 없이 직접 렌더링한다.
  return (
    <QuickCheckIn
      spotId={spotId}
      spotName={`${spotIndex}번 스팟 · ${spotName}`}
      onClose={onClose}
      onSuccess={handleCheckInSuccess}
    />
  )
}
