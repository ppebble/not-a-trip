import { AlertTriangleIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

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
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 px-6 dark:bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-lg">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-danger-surface px-3 py-1 text-xs font-medium text-danger">
          <AlertTriangleIcon size={16} color="currentColor" />
          불러오기 실패
        </div>

        <MascotIllustration
          variant="confirm"
          size="md"
          className="mx-auto mb-3"
        />

        <p className="text-text text-lg font-semibold">
          스팟 데이터를 불러오지 못했습니다
        </p>

        <p className="text-text-secondary mt-2 text-sm">
          잠시 후 다시 시도하거나 네트워크 상태를 확인해 주세요.
        </p>

        <p className="mt-3 rounded-xl bg-accent-surface px-4 py-3 text-xs leading-5 text-muted">
          {error.message}
        </p>

        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-400"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
