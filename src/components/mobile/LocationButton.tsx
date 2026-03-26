'use client'

/**
 * LocationButton 컴포넌트
 * 현재 위치로 이동하는 버튼
 * - 화면 하단 우측 배치
 * - 로딩/에러 상태 표시
 * - useGeolocation 훅 연동
 *
 * @requirements 1.4
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { useGeolocation, type GeolocationError } from '@/hooks/useGeolocation'

interface LocationButtonProps {
  /** 위치 획득 성공 시 콜백 (lat, lng) */
  onLocationFound: (lat: number, lng: number) => void
  /** 에러 발생 시 콜백 */
  onError?: (error: GeolocationError) => void
  /** 추가 클래스명 */
  className?: string
}

export default function LocationButton({
  onLocationFound,
  onError,
  className = '',
}: LocationButtonProps) {
  const { isLoading, error, getCurrentPosition, coordinates, clearError } =
    useGeolocation()
  const [requested, setRequested] = useState(false)
  const onLocationFoundRef = useRef(onLocationFound)
  const onErrorRef = useRef(onError)

  // ref 최신화
  onLocationFoundRef.current = onLocationFound
  onErrorRef.current = onError

  // 좌표 획득 성공 시 콜백
  useEffect(() => {
    if (requested && coordinates) {
      onLocationFoundRef.current(coordinates.lat, coordinates.lng)
      setRequested(false)
    }
  }, [requested, coordinates])

  // 에러 발생 시 콜백
  useEffect(() => {
    if (requested && error && !isLoading) {
      onErrorRef.current?.(error)
      setRequested(false)
    }
  }, [requested, error, isLoading])

  const handleClick = useCallback(() => {
    clearError()
    setRequested(true)
    getCurrentPosition()
  }, [getCurrentPosition, clearError])

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-70 ${className}`}
      aria-label="현재 위치로 이동"
      title="현재 위치로 이동"
    >
      {isLoading ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      ) : (
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2v2m0 16v2m10-10h-2M4 12H2"
          />
        </svg>
      )}
    </button>
  )
}
