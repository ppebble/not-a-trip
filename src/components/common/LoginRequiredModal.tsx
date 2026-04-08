'use client'

interface LoginRequiredModalProps {
  isOpen: boolean
  title?: string
  description?: string
  onConfirm: () => void
}

/**
 * 로그인 필요 모달 컴포넌트
 *
 * 로그인이 필요한 기능에 접근할 때 표시되는 공통 모달입니다.
 */
export function LoginRequiredModal({
  isOpen,
  title = '로그인이 필요한 서비스입니다',
  description = '이 기능을 사용하려면 로그인이 필요합니다.',
  onConfirm,
}: LoginRequiredModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-sm rounded-lg bg-surface p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <svg
              className="h-6 w-6 text-amber-600 dark:text-amber-400"
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
        </div>
        <h3 className="mb-2 text-center text-lg font-semibold text-primary-800 dark:text-primary-300">
          {title}
        </h3>
        <p className="mb-6 text-center text-sm text-secondary dark:text-secondary-400">
          {description}
          <br />
          로그인 페이지로 이동합니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          로그인하러 가기
        </button>
      </div>
    </div>
  )
}
