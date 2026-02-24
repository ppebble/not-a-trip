/**
 * 푸시 알림 유틸리티
 * 알림 권한 요청, 구독 등록/해제, 페이로드 생성
 *
 * @requirements 4.3
 */

// ============================================
// 타입 정의
// ============================================

/** 푸시 알림 유형 */
export type PushNotificationType =
  | 'badge_earned'
  | 'spot_approved'
  | 'comment_reply'
  | 'new_checkin'

/** 푸시 알림 페이로드 */
export interface PushNotificationPayload {
  type: PushNotificationType
  title: string
  body: string
  icon?: string
  url?: string
  data?: Record<string, unknown>
  tag?: string
}

/** 알림 권한 상태 */
export type NotificationPermissionState = 'granted' | 'denied' | 'default'

/** 구독 결과 */
export interface SubscriptionResult {
  success: boolean
  subscription?: PushSubscription
  error?: string
}

// ============================================
// 알림 권한 요청
// ============================================

/**
 * 브라우저가 푸시 알림을 지원하는지 확인
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

/**
 * 현재 알림 권한 상태 조회
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!isPushSupported()) return 'denied'
  return Notification.permission as NotificationPermissionState
}

/**
 * 알림 권한 요청
 * @returns 권한 상태 ('granted' | 'denied' | 'default')
 */
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (!isPushSupported()) {
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    return permission as NotificationPermissionState
  } catch {
    return 'denied'
  }
}

// ============================================
// 구독 등록/해제
// ============================================

/**
 * VAPID 공개키를 Uint8Array로 변환
 */
function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray.buffer as ArrayBuffer
}

/**
 * 푸시 알림 구독 등록
 * @returns 구독 결과
 */
export async function subscribeToPush(): Promise<SubscriptionResult> {
  if (!isPushSupported()) {
    return { success: false, error: '푸시 알림이 지원되지 않는 브라우저입니다' }
  }

  const permission = await requestNotificationPermission()
  if (permission !== 'granted') {
    return { success: false, error: '알림 권한이 거부되었습니다' }
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

    if (!vapidPublicKey) {
      return { success: false, error: 'VAPID 공개키가 설정되지 않았습니다' }
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })

    // 서버에 구독 정보 저장
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON()),
    })

    if (!response.ok) {
      throw new Error('구독 정보 저장 실패')
    }

    return { success: true, subscription }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : '구독 등록에 실패했습니다'
    return { success: false, error: message }
  }
}

/**
 * 푸시 알림 구독 해제
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (!subscription) return true

    // 서버에서 구독 정보 삭제
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    })

    await subscription.unsubscribe()
    return true
  } catch {
    return false
  }
}

/**
 * 현재 구독 상태 확인
 */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.ready
    return await registration.pushManager.getSubscription()
  } catch {
    return null
  }
}

// ============================================
// 알림 페이로드 생성
// ============================================

/**
 * 뱃지 획득 알림 페이로드 생성
 */
export function createBadgeEarnedPayload(
  badgeName: string,
  badgeIcon?: string
): PushNotificationPayload {
  return {
    type: 'badge_earned',
    title: '🏆 새로운 뱃지 획득!',
    body: `"${badgeName}" 뱃지를 획득했습니다!`,
    icon: badgeIcon || '/icons/badge-default.png',
    url: '/profile',
    tag: 'badge-earned',
    data: { badgeName },
  }
}

/**
 * 제보 승인 알림 페이로드 생성
 */
export function createSpotApprovedPayload(
  spotName: string,
  spotId: string
): PushNotificationPayload {
  return {
    type: 'spot_approved',
    title: '✅ 스팟 제보 승인!',
    body: `"${spotName}" 스팟이 승인되었습니다!`,
    icon: '/icons/spot-approved.png',
    url: `/spots/${spotId}`,
    tag: `spot-approved-${spotId}`,
    data: { spotId, spotName },
  }
}

/**
 * 댓글 답글 알림 페이로드 생성
 */
export function createCommentReplyPayload(
  authorName: string,
  postId: string
): PushNotificationPayload {
  return {
    type: 'comment_reply',
    title: '💬 새 답글',
    body: `${authorName}님이 답글을 남겼습니다`,
    icon: '/icons/comment-reply.png',
    url: `/community?postId=${postId}`,
    tag: `comment-reply-${postId}`,
    data: { authorName, postId },
  }
}

/**
 * 새 인증 알림 페이로드 생성
 */
export function createNewCheckInPayload(
  userName: string,
  spotName: string,
  spotId: string
): PushNotificationPayload {
  return {
    type: 'new_checkin',
    title: '📸 새 인증샷',
    body: `${userName}님이 "${spotName}"에서 인증했습니다`,
    icon: '/icons/new-checkin.png',
    url: `/spots/${spotId}`,
    tag: `new-checkin-${spotId}`,
    data: { userName, spotName, spotId },
  }
}
