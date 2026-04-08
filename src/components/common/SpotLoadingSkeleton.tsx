import { SpinnerIcon } from '@/components/icons'

/**
 * 스팟 데이터 로딩 중 표시되는 컴포넌트
 * Requirements: 3.1, 3.6
 */
export function SpotLoadingSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-neutral-100">
      <div className="text-center">
        <SpinnerIcon
          size="lg"
          className="mx-auto animate-spin text-neutral-400 dark:text-neutral-200"
        />
        <p className="mt-2 text-sm text-neutral-500">스팟 데이터 로딩 중...</p>
      </div>
    </div>
  )
}
