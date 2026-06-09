import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { SpotContentRelation } from '@/types'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * GET /api/spots/relations/by-content?contentName=... — 작품별 스팟 조회
 * Requirements: 6.1, 6.4
 *
 * - 해당 contentName의 active 관계에서 고유 spotId 목록 반환
 * - contentName 파라미터 누락 시 400
 * - DB 오류 시 500
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const contentName = searchParams.get('contentName')

    if (!contentName) {
      return NextResponse.json(
        {
          error: '잘못된 요청입니다',
          details: 'contentName 파라미터가 필요합니다',
        },
        { status: 400 }
      )
    }

    const relationsCollection = await getCollection<SpotContentRelation>(
      COLLECTIONS.SPOT_CONTENT_RELATIONS
    )

    // contentName + active 상태의 관계에서 고유 spotId 추출
    const relations = await relationsCollection
      .find({ contentName, status: 'active' })
      .project({ spotId: 1 })
      .toArray()

    const spotIds = [...new Set(relations.map((r) => r.spotId as string))]

    return NextResponse.json({ spotIds, total: spotIds.length })
  } catch (error) {
    runtimeLogger.error('Error fetching spots by content:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
