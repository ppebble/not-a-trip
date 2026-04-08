import { AlertTriangleIcon } from '@/components/icons'

interface SpotErrorDisplayProps {
  error: Error
  onRetry: () => void
}

/**
 * 스팟 데이터 로딩 에러 표시 컴포넌트
 * Requirements: 3.2, 3.6
 */
export function SpotErrorDisplay({ error, onRetry }: SpotErrorDisplayProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-danger-surface p-3 dark:bg-red-900/30">
          <AlertTriangleIcon size={24} color="#dc2626" />
        </div>
        <p className="mt-4 text-neutral-700 dark:text-neutral-200">
          스팟 데이터를 불러올 수 없습니다
        </p>
        <p className="mt-1 text-xs text-muted dark:text-neutral-500">
          {error.message}
        </p>
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-primary px-4 py-2 text-sm text-white transition-colors hover:bg-primary-400"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
