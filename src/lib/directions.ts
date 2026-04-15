/**
 * 길찾기 딥링크 유틸리티
 * 플랫폼별 지도 앱 딥링크 URL 생성
 *
 * @requirements 1.1, 1.2, 1.3, 1.4, 2.3
 */

/** 대한민국 좌표 경계 */
const KOREA_BOUNDARY = {
  lat: { min: 33.0, max: 38.7 },
  lng: { min: 124.5, max: 132.0 },
} as const

/**
 * 좌표가 대한민국 영토 범위 내인지 판별
 * @param lat 위도
 * @param lng 경도
 * @returns 국내 좌표 여부
 */
export function isKoreanCoordinates(lat: number, lng: number): boolean {
  return (
    lat >= KOREA_BOUNDARY.lat.min &&
    lat <= KOREA_BOUNDARY.lat.max &&
    lng >= KOREA_BOUNDARY.lng.min &&
    lng <= KOREA_BOUNDARY.lng.max
  )
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface DirectionsOptions {
  /** 목적지 좌표 */
  destination: Coordinates
  /** 목적지 이름 */
  destinationName?: string
  /** 선호 앱 (auto: 자동 감지) */
  preferredApp?: 'google' | 'apple' | 'kakao' | 'naver' | 'auto'
}

export interface DirectionsUrls {
  google: string
  apple: string
  kakao: string
  naver: string
}

/**
 * 길찾기 딥링크 URL 생성 함수
 *
 * 각 플랫폼의 Universal Link / Deep Link 표준 포맷 사용:
 * - Google Maps: Universal Link (https://www.google.com/maps/dir/)
 * - Apple Maps: URL Scheme (maps://)
 * - Kakao Map: URL Scheme (kakaomap://)
 * - Naver Map: URL Scheme (nmap://)
 */
export function generateDirectionsUrls(
  options: DirectionsOptions
): DirectionsUrls {
  const { destination, destinationName = '' } = options
  const encodedName = encodeURIComponent(destinationName)

  return {
    google: `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`,
    apple: `maps://maps.apple.com/?daddr=${destination.lat},${destination.lng}&dirflg=w`,
    kakao: `kakaomap://route?ep=${destination.lat},${destination.lng}&by=FOOT`,
    naver: `nmap://route/walk?dlat=${destination.lat}&dlng=${destination.lng}&dname=${encodedName}&appname=com.notatrip`,
  }
}

/**
 * 사용자 플랫폼 감지
 */
export function detectPlatform(): 'ios' | 'android' | 'web' {
  if (typeof navigator === 'undefined') return 'web'
  const userAgent = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'web'
}

/**
 * 플랫폼별 기본 지도 앱 반환
 */
export function getDefaultMapApp(
  platform: 'ios' | 'android' | 'web'
): keyof DirectionsUrls {
  switch (platform) {
    case 'ios':
      return 'apple'
    case 'android':
      return 'google'
    default:
      return 'google'
  }
}

/**
 * 길찾기 URL을 새 창에서 열기
 */
export function openDirections(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}
