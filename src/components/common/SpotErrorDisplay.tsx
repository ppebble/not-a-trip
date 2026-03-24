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
    <div className="bg-navy-800 flex h-full w-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-red-100 p-3">
          <AlertTriangleIcon size={24} color="#dc2626" />
        </div>
        <p className="text-navy-200 mt-4">스팟 데이터를 불러올 수 없습니다</p>
        <p className="text-navy-400 mt-1 text-xs">{error.message}</p>
        <button
          onClick={onRetry}
          className="bg-navy-600 hover:bg-navy-500 mt-3 rounded px-4 py-2 text-sm text-white transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
