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
        <div className="bg-navy-100 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <SearchIcon size="lg" className="text-navy-400" />
        </div>
        <p className="text-navy-800 text-lg font-semibold">
          검색 결과가 없습니다
        </p>
        <p className="text-navy-500 mt-2 text-sm">
          &quot;{searchQuery}&quot;에 해당하는 스팟을 찾을 수 없습니다
        </p>
        <p className="text-navy-400 mt-1 text-xs">
          다른 검색어를 입력하거나 필터를 조정해 보세요
        </p>
      </div>
    </div>
  )
}
