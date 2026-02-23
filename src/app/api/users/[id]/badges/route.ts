import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { UserBadge, Badge } from '@/types'

/**
 * UserBadge MongoDB Document
 */
interface UserBadgeDocument {
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
}

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
 * GET /api/users/[id]/badges - 유저 획득 뱃지 조회
 * Requirements: 3.1
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const userBadgesCollection = await getCollection<UserBadgeDocument>(
      COLLECTIONS.USER_BADGES
    )
    const badgesCollection = await getCollection<BadgeDocument>(
      COLLECTIONS.BADGES
    )

    // 유저가 획득한 뱃지 목록
    const userBadges = await userBadgesCollection
      .find({ userId })
      .sort({ earnedAt: -1 })
      .toArray()

    // 뱃지 상세 정보 조인
    const badgeIds = userBadges.map((ub) => ub.badgeId)
    const badges = await badgesCollection
      .find({ id: { $in: badgeIds } })
      .toArray()

    const badgeMap = new Map(badges.map((b) => [b.id, b]))

    const result: UserBadge[] = userBadges.map((ub) => {
      const badge = badgeMap.get(ub.badgeId)
      return {
        id: ub.id,
        userId: ub.userId,
        badgeId: ub.badgeId,
        badge: badge
          ? ({
              id: badge.id,
              code: badge.code,
              name: badge.name,
              description: badge.description,
              iconUrl: badge.iconUrl,
              type: badge.type,
              contentName: badge.contentName,
              condition: badge.condition,
              createdAt: badge.createdAt,
            } as Badge)
          : undefined,
        earnedAt: ub.earnedAt,
      }
    })

    return NextResponse.json({ badges: result, total: result.length })
  } catch (error) {
    console.error('Error fetching user badges:', error)
    return NextResponse.json(
      { error: '유저 뱃지 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
