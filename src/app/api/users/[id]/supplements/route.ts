import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * GET /api/users/[id]/supplements - 유저의 정보보완 신청 목록
 * Requirements: 9.5
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const supplementsCollection = await getCollection(
      COLLECTIONS.SPOT_SUPPLEMENTS
    )

    const supplements = await supplementsCollection
      .find({ contributorId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = supplements.map((supplement) => ({
      id: supplement._id.toString(),
      spotName: supplement.spotName || '이름 없음',
      type: supplement.type || supplement.supplementType || '기타',
      status: supplement.status || 'pending',
      createdAt:
        supplement.createdAt instanceof Date
          ? supplement.createdAt.toISOString()
          : supplement.createdAt,
    }))

    return NextResponse.json({ supplements: result })
  } catch (error) {
    runtimeLogger.error('Error fetching user supplements:', error)
    return NextResponse.json(
      { error: '정보보완 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
