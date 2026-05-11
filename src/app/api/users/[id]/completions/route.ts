import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/users/[id]/completions - 유저의 코스 완주 기록
 * Requirements: 9.3
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const completionsCollection = await getCollection(
      COLLECTIONS.ROUTE_COMPLETIONS
    )
    const routesCollection = await getCollection(COLLECTIONS.ROUTES)

    const completions = await completionsCollection
      .find({ userId })
      .sort({ completedAt: -1 })
      .toArray()

    const result = await Promise.all(
      completions.map(async (completion) => {
        let routeDoc = null
        try {
          routeDoc = await routesCollection.findOne({
            _id: new ObjectId(completion.routeId),
          })
        } catch {
          routeDoc = null
        }

        return {
          id: completion._id.toString(),
          routeId: completion.routeId,
          routeName: routeDoc?.name || '삭제된 코스',
          spotCount: routeDoc?.spots?.length ?? 0,
          completedAt:
            completion.completedAt instanceof Date
              ? completion.completedAt.toISOString()
              : completion.completedAt,
        }
      })
    )

    return NextResponse.json({ completions: result })
  } catch (error) {
    console.error('Error fetching user completions:', error)
    return NextResponse.json(
      { error: '완주 기록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
