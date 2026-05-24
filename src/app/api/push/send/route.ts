import { NextRequest, NextResponse } from 'next/server'

import { getCollection, COLLECTIONS } from '@/lib/db'
import type { PushNotificationPayload } from '@/lib/push-notifications'

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

interface SendNotificationBody {
  userId?: string
  payload: PushNotificationPayload
}

interface WebPushModule {
  setVapidDetails: (
    subject: string,
    publicKey: string,
    privateKey: string
  ) => void
  sendNotification: (
    subscription: {
      endpoint: string
      keys: { p256dh: string; auth: string }
    },
    payload: string
  ) => Promise<unknown>
}

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

    let sent = 0
    const failed: string[] = []

    for (const sub of subscriptions) {
      try {
        await sendWebPush(sub, notificationPayload)
        sent++
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Push send failed (${sub.endpoint}):`, error)
        failed.push(sub.endpoint)

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
    // eslint-disable-next-line no-console
    console.error('Push notification send failed:', error)
    return NextResponse.json(
      { error: '알림 발송에 실패했습니다' },
      { status: 500 }
    )
  }
}

async function loadWebPushModule(): Promise<WebPushModule | null> {
  try {
    const dynamicImport = new Function(
      'modulePath',
      'return import(modulePath)'
    ) as (modulePath: string) => Promise<{ default?: unknown }>

    const imported = (await dynamicImport('web-push')) as {
      default?: WebPushModule
    } & WebPushModule

    return (imported.default ?? imported) as WebPushModule
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes('Cannot find module') ||
        error.message.includes("Cannot find package 'web-push'"))
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        'web-push package is not installed. Install it to enable push delivery.'
      )
      return null
    }

    throw error
  }
}

async function sendWebPush(
  subscription: PushSubscriptionDocument,
  payload: string
): Promise<void> {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
  const vapidEmail = process.env.VAPID_EMAIL

  if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
    // eslint-disable-next-line no-console
    console.warn('VAPID keys are not configured. Skipping push delivery.')
    return
  }

  const webpush = await loadWebPushModule()
  if (!webpush) {
    return
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
}

function isExpiredSubscription(error: unknown): boolean {
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const statusCode = (error as { statusCode: number }).statusCode
    return statusCode === 404 || statusCode === 410
  }

  return false
}
