import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { UserStats } from '@/types'

/**
 * GET /api/users/[id]/stats - 유저 통계 조회 (확장)
 * Requirements: 3.3, 8.4, 8.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const statsCollection = await getCollection<UserStats>(
      COLLECTIONS.USER_STATS
    )
    const completionsCollection = await getCollection(
      COLLECTIONS.ROUTE_COMPLETIONS
    )
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const reportsCollection = await getCollection(COLLECTIONS.SPOT_REPORTS)
    const postsCollection = await getCollection(COLLECTIONS.POSTS)

    const stats = await statsCollection.findOne({ userId })

    // 추가 통계 집계
    const [completedRoutes, registeredSpots, reportCount, postCount] =
      await Promise.all([
        completionsCollection.countDocuments({ userId }),
        spotsCollection.countDocuments({ authorId: userId }),
        reportsCollection.countDocuments({ reporterId: userId }),
        postsCollection.countDocuments({ userId }),
      ])

    const baseStats = stats || {
      userId,
      totalCheckIns: 0,
      uniqueSpots: 0,
      badgeCount: 0,
      contentProgress: [],
      updatedAt: new Date(),
    }

    return NextResponse.json({
      ...baseStats,
      completedRoutes,
      registeredSpots,
      reportCount,
      postCount,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: '유저 통계 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
