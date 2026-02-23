import { NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/checkins/stats - 갤러리 통계 조회
 * Returns totalCheckIns and todayCheckIns
 * Requirements: 5.3
 */
export async function GET(): Promise<NextResponse> {
  try {
    const collection = await getCollection(COLLECTIONS.CHECKINS)

    // 오늘 자정 시간 계산 (UTC 기준)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    // 총 인증 수와 오늘 인증 수를 병렬로 조회
    const [totalCheckIns, todayCheckIns] = await Promise.all([
      collection.countDocuments({}),
      collection.countDocuments({
        createdAt: { $gte: today },
      }),
    ])

    return NextResponse.json({
      totalCheckIns,
      todayCheckIns,
    })
  } catch (error) {
    console.error('Error fetching checkin stats:', error)
    return NextResponse.json(
      { error: '통계 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
