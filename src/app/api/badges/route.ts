import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Badge, DEFAULT_BADGE_DEFINITIONS } from '@/types'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * Badge MongoDB Document
 */
interface BadgeDocument {
  id: string
  code: string
  name: string
  description: string
  iconUrl: string
  type: 'achievement' | 'content' | 'special'
  contentName?: string
  condition: {
    type: 'checkin_count' | 'content_progress' | 'first_action'
    requiredCount?: number
    requiredProgress?: number
    contentName?: string
  }
  createdAt: Date
}

/**
 * 기본 뱃지 초기화 (없으면 생성)
 */
async function initializeDefaultBadges(): Promise<void> {
  const collection = await getCollection<BadgeDocument>(COLLECTIONS.BADGES)

  for (const badgeDef of DEFAULT_BADGE_DEFINITIONS) {
    const exists = await collection.findOne({ code: badgeDef.code })
    if (!exists) {
      await collection.insertOne({
        id: `BADGE-${badgeDef.code.toUpperCase()}`,
        ...badgeDef,
        createdAt: new Date(),
      })
    }
  }
}

/**
 * GET /api/badges - 전체 뱃지 목록 조회
 * Requirements: 4.5
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 기본 뱃지 초기화
    await initializeDefaultBadges()

    const collection = await getCollection<BadgeDocument>(COLLECTIONS.BADGES)
    const badges = await collection.find({}).toArray()

    const result: Badge[] = badges.map((doc) => ({
      id: doc.id,
      code: doc.code,
      name: doc.name,
      description: doc.description,
      iconUrl: doc.iconUrl,
      type: doc.type,
      contentName: doc.contentName,
      condition: doc.condition,
      createdAt: doc.createdAt,
    }))

    return NextResponse.json({ badges: result, total: result.length })
  } catch (error) {
    runtimeLogger.error('Error fetching badges:', error)
    return NextResponse.json(
      { error: '뱃지 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
