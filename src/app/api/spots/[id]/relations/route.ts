import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { SpotContentRelation } from '@/types'

/**
 * GET /api/spots/[id]/relations - 스팟별 관계 목록 조회
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * - active 상태의 SpotContentRelation만 반환
 * - displayPriority 오름차순 정렬
 * - 스팟 미존재 시 404, DB 오류 시 500
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: spotId } = await params

    // 스팟 존재 여부 확인
    const spotsCollection = await getCollection(COLLECTIONS.SPOTS)
    const spot = await spotsCollection.findOne({ id: spotId })

    if (!spot) {
      return NextResponse.json(
        { error: '스팟을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // active 상태의 관계를 displayPriority 오름차순으로 조회
    const relationsCollection = await getCollection<SpotContentRelation>(
      COLLECTIONS.SPOT_CONTENT_RELATIONS
    )

    const relations = await relationsCollection
      .find({ spotId, status: 'active' })
      .sort({ displayPriority: 1 })
      .toArray()

    return NextResponse.json({ relations, total: relations.length })
  } catch (error) {
    console.error('Error fetching spot relations:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
