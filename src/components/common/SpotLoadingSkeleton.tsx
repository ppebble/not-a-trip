import { SpinnerIcon } from '@/components/icons'

/**
 * 스팟 데이터 로딩 중 표시되는 컴포넌트
 * Requirements: 3.1, 3.6
 */
export function SpotLoadingSkeleton() {
  return (
    <div className="bg-navy-800 flex h-full w-full items-center justify-center">
      <div className="text-center">
        <SpinnerIcon size="lg" className="mx-auto animate-spin" />
        <p className="text-navy-200 mt-2 text-sm">스팟 데이터 로딩 중...</p>
      </div>
    </div>
  )
}
