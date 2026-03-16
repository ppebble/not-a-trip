import { SearchIcon } from '@/components/icons'

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
      <div className="pointer-events-auto rounded-xl bg-white/95 px-8 py-6 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-navy-100">
          <SearchIcon size="lg" className="text-navy-400" />
        </div>
        <p className="text-lg font-semibold text-navy-800">
          검색 결과가 없습니다
        </p>
        <p className="mt-2 text-sm text-navy-500">
          &quot;{searchQuery}&quot;에 해당하는 스팟을 찾을 수 없습니다
        </p>
        <p className="mt-1 text-xs text-navy-400">
          다른 검색어를 입력하거나 필터를 조정해 보세요
        </p>
      </div>
    </div>
  )
}
