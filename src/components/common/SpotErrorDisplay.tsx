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
    <div className="flex h-full w-full items-center justify-center bg-navy-800">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
          <AlertTriangleIcon size={24} color="#dc2626" />
        </div>
        <p className="mt-4 text-navy-200">스팟 데이터를 불러올 수 없습니다</p>
        <p className="mt-1 text-xs text-navy-400">{error.message}</p>
        <button
          onClick={onRetry}
          className="mt-3 rounded bg-navy-600 px-4 py-2 text-sm text-white transition-colors hover:bg-navy-500"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
