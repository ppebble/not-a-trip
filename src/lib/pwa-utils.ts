/**
 * PWA 관련 유틸리티 함수
 *
 * @requirements 6.2
 */

/**
 * User-Agent 문자열을 분석하여 iOS Safari 브라우저인지 감지한다.
 * `iphone`, `ipad`, `ipod` 키워드가 포함된 UA에서 true를 반환한다.
 *
 * @param userAgent - 검사할 User-Agent 문자열 (기본값: navigator.userAgent)
 * @returns iOS Safari 여부
 */
export function isIosSafari(userAgent?: string): boolean {
  const ua =
    userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  return /iphone|ipad|ipod/i.test(ua)
}
