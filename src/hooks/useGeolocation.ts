/**
 * useGeolocation 훅
 * 위치 정보 접근 및 권한 관리
 *
 * - navigator.geolocation.getCurrentPosition 래핑
 * - 권한 상태 관리 (granted/denied/prompt)
 * - 에러 핸들링 및 폴백 상태 관리
 *
 * @requirements 1.4, 1.5
 */

import { useState, useEffect, useCallback, useRef } from 'react'

export interface GeolocationCoordinates {
  lat: number
  lng: number
}

export interface GeolocationError {
  code: 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNKNOWN'
  message: string
}

export type PermissionState = 'granted' | 'denied' | 'prompt' | null

export interface GeolocationState {
  /** 현재 좌표 */
  coordinates: GeolocationCoordinates | null
  /** 정확도 (m) */
  accuracy: number | null
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 상태 */
  error: GeolocationError | null
  /** 권한 상태 */
  permissionState: PermissionState
}

export interface UseGeolocationOptions {
  /** 높은 정확도 사용 여부 (기본: true) */
  enableHighAccuracy?: boolean
  /** 타임아웃 (ms, 기본: 10000) */
  timeout?: number
  /** 캐시 최대 수명 (ms, 기본: 300000 = 5분) */
  maximumAge?: number
}

export interface UseGeolocationReturn extends GeolocationState {
  /** 현재 위치 요청 */
  getCurrentPosition: () => void
  /** 위치 감시 시작 */
  watchPosition: () => void
  /** 위치 감시 중지 */
  clearWatch: () => void
  /** 에러 초기화 */
  clearError: () => void
}

function mapGeolocationError(
  error: GeolocationPositionError
): GeolocationError {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return {
        code: 'PERMISSION_DENIED',
        message: '위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.',
      }
    case error.POSITION_UNAVAILABLE:
      return {
        code: 'POSITION_UNAVAILABLE',
        message:
          'GPS 신호를 수신할 수 없습니다. 실외로 이동하거나 잠시 후 다시 시도해주세요.',
      }
    case error.TIMEOUT:
      return {
        code: 'TIMEOUT',
        message: '위치 확인에 시간이 오래 걸리고 있습니다.',
      }
    default:
      return {
        code: 'UNKNOWN',
        message: '알 수 없는 오류가 발생했습니다.',
      }
  }
}

const DEFAULT_OPTIONS: UseGeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 300000,
}

export function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const watchIdRef = useRef<number | null>(null)

  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    accuracy: null,
    isLoading: false,
    error: null,
    permissionState: null,
  })

  // 권한 상태 감시
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.permissions) return

    let permissionStatus: PermissionStatus | null = null

    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        permissionStatus = status
        setState((prev) => ({
          ...prev,
          permissionState: status.state as PermissionState,
        }))

        status.addEventListener('change', () => {
          setState((prev) => ({
            ...prev,
            permissionState: status.state as PermissionState,
          }))
        })
      })
      .catch(() => {
        // permissions API 미지원 브라우저
      })

    return () => {
      // PermissionStatus의 change 이벤트 리스너는 GC에 의해 정리됨
      void permissionStatus
    }
  }, [])

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState((prev) => ({
      ...prev,
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      accuracy: position.coords.accuracy,
      isLoading: false,
      error: null,
      permissionState: 'granted',
    }))
  }, [])

  const handleError = useCallback((error: GeolocationPositionError) => {
    const mappedError = mapGeolocationError(error)
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: mappedError,
      permissionState:
        error.code === error.PERMISSION_DENIED
          ? 'denied'
          : prev.permissionState,
    }))
  }, [])

  const getCurrentPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: {
          code: 'POSITION_UNAVAILABLE',
          message: '이 브라우저에서는 위치 서비스를 지원하지 않습니다.',
        },
      }))
      return
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeout,
      maximumAge: opts.maximumAge,
    })
  }, [
    handleSuccess,
    handleError,
    opts.enableHighAccuracy,
    opts.timeout,
    opts.maximumAge,
  ])

  const watchPosition = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return

    // 기존 watch 정리
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        timeout: opts.timeout,
        maximumAge: opts.maximumAge,
      }
    )
  }, [
    handleSuccess,
    handleError,
    opts.enableHighAccuracy,
    opts.timeout,
    opts.maximumAge,
  ])

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  // 언마운트 시 watch 정리
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    clearError,
  }
}
