import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { UserStats } from '@/types'

/**
 * GET /api/users/[id]/stats - 유저 통계 조회
 * Requirements: 3.3
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

    let stats = await statsCollection.findOne({ userId })

    // 통계가 없으면 기본값 반환
    if (!stats) {
      stats = {
        userId,
        totalCheckIns: 0,
        uniqueSpots: 0,
        badgeCount: 0,
        contentProgress: [],
        updatedAt: new Date(),
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: '유저 통계 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
