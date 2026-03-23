/**
 * Sentry 환경별 설정 헬퍼
 */

export interface SentryConfig {
  sampleRate: number
  tracesSampleRate: number
  replaysSessionSampleRate: number
  replaysOnErrorSampleRate: number
}

/**
 * 환경에 따른 Sentry 설정값을 반환한다.
 * - development: 모든 전송 비활성화
 * - production: 에러 전수 수집, 트레이싱/리플레이 10% 샘플링
 */
export function getSentryConfig(env: string): SentryConfig {
  if (env === 'production') {
    return {
      sampleRate: 1.0,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    }
  }

  return {
    sampleRate: 0,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  }
}

/**
 * DSN이 유효한 값인지 확인하여 Sentry 초기화 여부를 결정한다.
 * falsy 값(undefined, null, '')이면 false를 반환한다.
 */
export function isSentryEnabled(dsn: string | undefined | null): boolean {
  return Boolean(dsn && dsn.trim().length > 0)
}
