import { FilterIcon } from '@/components/icons'

/**
 * 카테고리 필터 전체 해제 시 빈 상태 오버레이 컴포넌트
 * Requirements: 3.3, 3.6
 */
export function EmptyFilterOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[999] flex items-center justify-center">
      <div className="pointer-events-auto rounded-xl bg-white/95 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
          <FilterIcon size="lg" className="text-navy-400" />
        </div>
        <p className="text-lg font-semibold text-navy-800">
          카테고리를 선택해주세요
        </p>
        <p className="mt-2 text-sm text-navy-500">
          표시할 스팟 카테고리가 선택되지 않았습니다
        </p>
        <p className="mt-1 text-xs text-navy-400">
          아래 필터에서 원하는 카테고리를 선택하세요
        </p>
      </div>
    </div>
  )
}
