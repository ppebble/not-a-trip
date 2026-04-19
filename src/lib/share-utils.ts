/**
 * 스팟/코스 공유 유틸리티
 * Spec: 29-ux-quality-phase2
 */

/** 스팟 공유 텍스트 생성 */
export function formatSpotShareText(
  spotName: string,
  contentName?: string
): string {
  if (contentName) {
    return `[Not a Trip] ${contentName}의 성지순례 스팟 ${spotName}을 확인해보세요!`
  }
  return `[Not a Trip] 성지순례 스팟 ${spotName}을 확인해보세요!`
}

/** 코스 공유 텍스트 생성 */
export function formatRouteShareText(routeName: string): string {
  return `[Not a Trip] ${routeName} 순례 코스를 확인해보세요!`
}

/** Web Share API 지원 여부 확인 (HTTPS 환경 + navigator.share 존재) */
export function canShare(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false
  }
  if (!navigator.share) {
    return false
  }
  // HTTP 환경(localhost 제외)에서는 Web Share API 사용 불가
  const isHttps = window.location.protocol === 'https:'
  const isLocalhost = window.location.hostname === 'localhost'
  return isHttps || isLocalhost
}

/** 공유 실행 (Web Share API → Clipboard 폴백) */
export async function executeShare(data: {
  title: string
  text: string
  url: string
}): Promise<'shared' | 'copied' | 'cancelled'> {
  if (canShare()) {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return 'cancelled'
      }
      // 기타 에러 시 클립보드 폴백으로 전환
    }
  }
  await navigator.clipboard.writeText(data.url)
  return 'copied'
}
