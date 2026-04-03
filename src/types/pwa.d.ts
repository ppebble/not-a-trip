/**
 * BeforeInstallPromptEvent 타입 선언
 *
 * 브라우저가 PWA 설치 조건을 충족했을 때 발생하는 이벤트.
 * 최신 명세에서는 userChoice의 platform 필드가 제거되었으나,
 * 하위 호환성을 위해 optional로 선언한다.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */

export {}

declare global {
  interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
      outcome: 'accepted' | 'dismissed'
      platform?: string
    }>
    prompt(): Promise<void>
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}
