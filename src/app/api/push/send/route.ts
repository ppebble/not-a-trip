import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import type { PushNotificationPayload } from '@/lib/push-notifications'

/**
 * 푸시 구독 MongoDB Document
 */
interface PushSubscriptionDocument {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  userId?: string
  createdAt: Date
  updatedAt: Date
}

/**
 * 알림 발송 요청 Body
 */
interface SendNotificationBody {
  /** 특정 유저에게만 발송 (없으면 전체) */
  userId?: string
  /** 알림 페이로드 */
  payload: PushNotificationPayload
}

/**
 * POST /api/push/send - 푸시 알림 발송
 * Requirements: 4.3
 *
 * web-push 라이브러리 미설치 시 구독 정보만 조회하고
 * 실제 발송은 web-push 설정 후 활성화
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: SendNotificationBody = await request.json()
    const { userId, payload } = body

    if (!payload?.type || !payload?.title || !payload?.body) {
      return NextResponse.json(
        { error: '유효하지 않은 알림 페이로드입니다 (type, title, body 필수)' },
        { status: 400 }
      )
    }

    const collection = await getCollection<PushSubscriptionDocument>(
      COLLECTIONS.PUSH_SUBSCRIPTIONS
    )

    // 대상 구독 조회
    const query = userId ? { userId } : {}
    const subscriptions = await collection.find(query).toArray()

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: '발송 대상 구독이 없습니다',
      })
    }

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      url: payload.url || '/',
      tag: payload.tag,
      data: {
        type: payload.type,
        url: payload.url || '/',
        ...payload.data,
      },
    })

    // web-push 라이브러리를 통한 실제 발송
    let sent = 0
    const failed: string[] = []

    for (const sub of subscriptions) {
      try {
        await sendWebPush(sub, notificationPayload)
        sent++
      } catch (error) {
        console.error(`푸시 발송 실패 (${sub.endpoint}):`, error)
        failed.push(sub.endpoint)

        // 410 Gone 또는 404 응답 시 구독 삭제
        if (isExpiredSubscription(error)) {
          await collection.deleteOne({ endpoint: sub.endpoint })
        }
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed: failed.length,
      total: subscriptions.length,
    })
  } catch (error) {
    console.error('푸시 알림 발송 실패:', error)
    return NextResponse.json(
      { error: '알림 발송에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * Web Push 발송 (web-push 라이브러리 래핑)
 * VAPID 키가 설정되지 않으면 스킵
 */
async function sendWebPush(
  subscription: PushSubscriptionDocument,
  payload: string
): Promise<void> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL

  if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
    console.warn('VAPID 키가 설정되지 않아 푸시 발송을 스킵합니다')
    return
  }

  // web-push 동적 import (서버 전용)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webpush = require('web-push') as {
      setVapidDetails: (
        subject: string,
        publicKey: string,
        privateKey: string
      ) => void
      sendNotification: (
        sub: { endpoint: string; keys: { p256dh: string; auth: string } },
        payload: string
      ) => Promise<unknown>
    }

    webpush.setVapidDetails(
      `mailto:${vapidEmail}`,
      vapidPublicKey,
      vapidPrivateKey
    )

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      payload
    )
  } catch (error) {
    // web-push 미설치 시 경고만 출력
    if (
      error instanceof Error &&
      error.message.includes('Cannot find module')
    ) {
      console.warn(
        'web-push 패키지가 설치되지 않았습니다. npm install web-push로 설치해주세요.'
      )
      return
    }
    throw error
  }
}

/**
 * 만료된 구독인지 확인
 */
function isExpiredSubscription(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode
    return statusCode === 404 || statusCode === 410
  }
  return false
}
