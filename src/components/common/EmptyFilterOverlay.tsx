import { FilterIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

/**
 * 카테고리 필터 전체 해제 시 빈 상태 오버레이 컴포넌트
 * Requirements: 3.3, 3.6
 */
export function EmptyFilterOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/95 px-8 py-7 text-center shadow-xl backdrop-blur-md">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent-surface px-3 py-1 text-xs font-medium text-text-secondary">
          <FilterIcon size="sm" className="text-primary" />
          필터 선택 필요
        </div>

        <MascotIllustration
          variant="greeting"
          size="md"
          className="mx-auto mb-3"
        />

        <p className="text-lg font-semibold text-primary-800 dark:text-primary-300">
          카테고리를 선택해 주세요
        </p>

        <p className="mt-2 text-sm text-secondary dark:text-neutral-400">
          표시할 스팟 카테고리가 아직 선택되지 않았습니다.
        </p>

        <p className="mt-2 rounded-xl bg-accent-surface px-4 py-3 text-xs leading-5 text-muted dark:text-neutral-400">
          관심 있는 장르를 고르면 마스코트가 그 분위기에 맞는 장소를 바로
          보여드릴게요.
        </p>
      </div>
    </div>
  )
}
