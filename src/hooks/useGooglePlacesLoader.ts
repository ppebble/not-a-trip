'use client'

import { useState, useCallback, useRef } from 'react'

const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-places-script'

interface UseGooglePlacesLoaderReturn {
  isLoaded: boolean
  loadError: Error | null
  loadScript: () => void
}

/**
 * Google Places API 스크립트를 온디맨드로 로드하는 훅
 *
 * - 초기 상태: isLoaded=false, loadError=null
 * - loadScript() 호출 시 <script> 태그 동적 삽입
 * - 이미 로드된 경우 중복 삽입 방지 (멱등성)
 * - 로드 실패 시 loadError 상태 설정
 */
export function useGooglePlacesLoader(): UseGooglePlacesLoaderReturn {
  const [isLoaded, setIsLoaded] = useState<boolean>(
    () => typeof google !== 'undefined' && !!google.maps?.places
  )
  const [loadError, setLoadError] = useState<Error | null>(null)
  const isLoadingRef = useRef(false)

  const loadScript = useCallback(() => {
    // 이미 로드 완료
    if (typeof google !== 'undefined' && google.maps?.places) {
      setIsLoaded(true)
      return
    }

    // 이미 로딩 중이거나 스크립트 태그가 존재
    if (
      isLoadingRef.current ||
      document.getElementById(GOOGLE_MAPS_SCRIPT_ID)
    ) {
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setLoadError(new Error('Google Maps API 키가 설정되지 않았습니다'))
      return
    }

    isLoadingRef.current = true

    const script = document.createElement('script')
    script.id = GOOGLE_MAPS_SCRIPT_ID
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ja&region=JP`
    script.async = true
    script.defer = true

    script.onload = () => {
      isLoadingRef.current = false
      setIsLoaded(true)
      setLoadError(null)
    }

    script.onerror = () => {
      isLoadingRef.current = false
      setLoadError(new Error('Google Maps 스크립트 로드에 실패했습니다'))
      // 실패한 스크립트 태그 제거하여 재시도 가능하게
      script.remove()
    }

    document.head.appendChild(script)
  }, [])

  return { isLoaded, loadError, loadScript }
}
