import { SearchIcon } from '@/components/icons'
import { MascotIllustration } from './MascotIllustration'

interface EmptySearchOverlayProps {
  searchQuery: string
}

/**
 * 검색 결과 없음 오버레이 컴포넌트
 * Requirements: 3.3, 3.6
 */
export function EmptySearchOverlay({ searchQuery }: EmptySearchOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-surface/95 px-8 py-7 text-center shadow-xl backdrop-blur-md">
        <div className="text-text-secondary mb-3 inline-flex items-center gap-2 rounded-full bg-accent-surface px-3 py-1 text-xs font-medium">
          <SearchIcon size="sm" className="text-primary" />
          검색 결과 없음
        </div>

        <MascotIllustration
          variant="confirm"
          size="md"
          className="mx-auto mb-3"
        />

        <p className="text-lg font-semibold text-primary-800 dark:text-primary-300">
          검색 결과가 없습니다
        </p>

        <p className="mt-2 text-sm text-secondary dark:text-neutral-400">
          &quot;{searchQuery}&quot;에 해당하는 스팟을 찾을 수 없습니다
        </p>

        <p className="mt-2 rounded-xl bg-accent-surface px-4 py-3 text-xs leading-5 text-muted dark:text-neutral-400">
          마스코트가 아직 단서를 못 찾았어요. 다른 검색어를 입력하거나 필터를
          조금 넓혀보세요.
        </p>
      </div>
    </div>
  )
}
