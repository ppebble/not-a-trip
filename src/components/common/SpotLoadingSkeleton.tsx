import { SpinnerIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

/**
 * 스팟 데이터 로딩 중 표시되는 컴포넌트
 * Requirements: 3.1, 3.6
 */
export function SpotLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100 px-6 dark:bg-background">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 text-center shadow-lg">
        <div className="text-text-secondary mb-3 inline-flex items-center gap-2 rounded-full bg-accent-surface px-3 py-1 text-xs font-medium">
          <SpinnerIcon size="sm" className="animate-spin text-primary" />
          스팟 탐색 중
        </div>

        <MascotIllustration
          variant="main"
          size="md"
          className="mx-auto mb-3 animate-pulse"
        />

        <p className="text-text text-lg font-semibold">
          특별한 장소를 찾고 있어요
        </p>

        <p className="text-text-secondary mt-2 text-sm">
          주변 스팟과 관련 정보를 정리하는 중입니다.
        </p>

        <div className="mt-4 overflow-hidden rounded-full bg-accent-surface">
          <div className="animate-loading-bar h-1.5 w-1/4 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
