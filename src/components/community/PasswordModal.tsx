'use client'

import { useState, FormEvent, useEffect, useRef } from 'react'

interface PasswordModalProps {
  isOpen: boolean
  title: string
  description?: string
  isLoading?: boolean
  error?: string | null
  onConfirm: (password: string) => void
  onCancel: () => void
}

/**
 * 비밀번호 입력 모달 컴포넌트
 *
 * 비회원 게시글/댓글 수정/삭제 시 비밀번호 확인을 위한 모달
 *
 * Requirements:
 * - 5.7: 게시글 수정 시 비밀번호 검증
 * - 5.8: 게시글 삭제 시 비밀번호 검증
 * - 16.8.9: 비밀번호 입력 모달 컴포넌트 구현
 */
export default function PasswordModal({
  isOpen,
  title,
  description,
  isLoading = false,
  error = null,
  onConfirm,
  onCancel,
}: PasswordModalProps) {
  const [password, setPassword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // 모달이 열릴 때 입력 필드에 포커스
  useEffect(() => {
    if (isOpen) {
      setPassword('')
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isLoading, onCancel])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password.trim() && !isLoading) {
      onConfirm(password)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLoading ? undefined : onCancel}
        aria-hidden="true"
      />

      {/* 모달 콘텐츠 */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* 헤더 */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-primary-800">{title}</h3>
        </div>

        {/* 설명 */}
        {description && (
          <p className="mb-4 text-sm text-primary">{description}</p>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* 비밀번호 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label
              htmlFor="modal-password"
              className="text-text-secondary mb-2 block text-sm font-medium"
            >
              비밀번호
            </label>
            <input
              ref={inputRef}
              type="password"
              id="modal-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="게시글 작성 시 입력한 비밀번호"
              disabled={isLoading}
              className="w-full rounded-lg border border-border px-4 py-3 text-primary-800 placeholder-muted transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-primary-50 disabled:opacity-50"
              autoComplete="off"
            />
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  확인 중...
                </span>
              ) : (
                '확인'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
