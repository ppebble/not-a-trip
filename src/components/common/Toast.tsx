'use client'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

/**
 * Toast 컴포넌트
 *
 * 하단 중앙에 위치하며 fade in/out 애니메이션을 제공한다.
 * 3초(기본) 후 자동 사라짐.
 *
 * @requirements 2.5
 */
export default function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible && !message) return null

  return (
    <div
      className={`fixed bottom-20 left-1/2 z-[9999] -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2.5 text-sm text-white shadow-lg transition-opacity duration-300 dark:bg-gray-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}
