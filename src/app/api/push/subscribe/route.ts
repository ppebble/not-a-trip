import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'

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
 * POST /api/push/subscribe - 푸시 알림 구독 등록
 * Requirements: 4.3
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: '유효하지 않은 구독 정보입니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection<PushSubscriptionDocument>(
      COLLECTIONS.PUSH_SUBSCRIPTIONS
    )

    // 기존 구독이 있으면 업데이트, 없으면 생성
    await collection.updateOne(
      { endpoint },
      {
        $set: {
          endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('푸시 구독 등록 실패:', error)
    return NextResponse.json(
      { error: '구독 등록에 실패했습니다' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/push/subscribe - 푸시 알림 구독 해제
 * Requirements: 4.3
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json(
        { error: 'endpoint가 필요합니다' },
        { status: 400 }
      )
    }

    const collection = await getCollection<PushSubscriptionDocument>(
      COLLECTIONS.PUSH_SUBSCRIPTIONS
    )

    await collection.deleteOne({ endpoint })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('푸시 구독 해제 실패:', error)
    return NextResponse.json(
      { error: '구독 해제에 실패했습니다' },
      { status: 500 }
    )
  }
}
