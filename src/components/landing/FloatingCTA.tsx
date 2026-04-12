'use client'

/**
 * 플로팅 CTA 컴포넌트
 * Hero 이탈 후 ~ Conversion 진입 전 화면 하단에 고정 표시
 * isStandalone 상태에 따라 "지도 탐색하기" 또는 "앱 설치하기" 동작 분기
 * CSS env(safe-area-inset-bottom) 적용으로 모바일 안전 영역 확보
 * Requirements: 4.4, 4.5, 4.6, 4.8
 */

interface FloatingCTAProps {
  visible: boolean
  isStandalone: boolean
  onInstallClick: () => void
  onExploreClick: () => void
}

export function FloatingCTA({
  visible,
  isStandalone,
  onInstallClick,
  onExploreClick,
}: FloatingCTAProps) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 pb-safe-bottom transition-transform duration-300 ease-in-out ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
      role="complementary"
      aria-label="플로팅 CTA"
      aria-hidden={!visible}
    >
      <div className="border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm">
        {isStandalone ? (
          <button
            type="button"
            onClick={onExploreClick}
            className="w-full rounded-lg bg-primary-500 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            지도 탐색하기
          </button>
        ) : (
          <button
            type="button"
            onClick={onInstallClick}
            className="w-full rounded-lg bg-primary-500 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            🛂 앱 설치하기
          </button>
        )}
      </div>
    </div>
  )
}
