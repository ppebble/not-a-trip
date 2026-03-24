'use client'

/**
 * GpsErrorFallback 컴포넌트
 * GPS 오류 시 폴백 UI
 * - 오류 유형별 메시지 표시
 * - 수동 지도 탐색 안내
 * - 설정 페이지 링크 (권한 거부 시)
 *
 * @requirements 1.5
 */

interface GpsErrorFallbackProps {
  /** GPS 에러 정보 */
  error: {
    code: string
    message: string
  }
  /** 닫기 핸들러 */
  onDismiss: () => void
}

/** 에러 코드별 아이콘 및 추가 안내 */
const ERROR_CONFIG: Record<
  string,
  { icon: string; hint: string; showSettingsLink: boolean }
> = {
  PERMISSION_DENIED: {
    icon: '🔒',
    hint: '브라우저 설정에서 위치 권한을 허용해주세요.',
    showSettingsLink: true,
  },
  POSITION_UNAVAILABLE: {
    icon: '📡',
    hint: '실외로 이동하거나 잠시 후 다시 시도해주세요.',
    showSettingsLink: false,
  },
  TIMEOUT: {
    icon: '⏱️',
    hint: '네트워크 상태를 확인하고 다시 시도해주세요.',
    showSettingsLink: false,
  },
  UNKNOWN: {
    icon: '❓',
    hint: '잠시 후 다시 시도해주세요.',
    showSettingsLink: false,
  },
}

export default function GpsErrorFallback({
  error,
  onDismiss,
}: GpsErrorFallbackProps) {
  const config = ERROR_CONFIG[error.code] || ERROR_CONFIG.UNKNOWN

  return (
    <div
      className="absolute bottom-20 left-4 right-4 z-[1001] rounded-xl bg-white p-4 shadow-xl md:bottom-4 md:left-auto md:right-16 md:w-80"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {config.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-navy-800 text-sm font-medium">{error.message}</p>
          <p className="text-navy-500 mt-1 text-xs">{config.hint}</p>

          {/* 수동 탐색 안내 */}
          <p className="text-navy-400 mt-2 text-xs">
            지도를 직접 드래그하여 원하는 위치를 탐색할 수 있습니다.
          </p>
        </div>

        {/* 닫기 버튼 */}
        <button
          onClick={onDismiss}
          className="text-navy-400 hover:bg-navy-100 hover:text-navy-600 flex-shrink-0 rounded-full p-1 transition-colors"
          aria-label="닫기"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
