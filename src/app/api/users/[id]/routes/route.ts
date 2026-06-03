import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { runtimeLogger } from '@/lib/runtime-logger'

/**
 * GET /api/users/[id]/routes - 유저가 만든 코스 목록
 * Requirements: 9.1
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const routesCollection = await getCollection(COLLECTIONS.ROUTES)
    const bookmarksCollection = await getCollection(COLLECTIONS.ROUTE_BOOKMARKS)

    const routes = await routesCollection
      .find({ authorId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = await Promise.all(
      routes.map(async (route) => {
        const bookmarkCount = await bookmarksCollection.countDocuments({
          routeId: route._id.toString(),
        })
        return {
          id: route._id.toString(),
          name: route.name,
          spotCount: route.spots?.length ?? 0,
          bookmarkCount,
          createdAt:
            route.createdAt instanceof Date
              ? route.createdAt.toISOString()
              : route.createdAt,
        }
      })
    )

    return NextResponse.json({ routes: result })
  } catch (error) {
    runtimeLogger.error('Error fetching user routes:', error)
    return NextResponse.json(
      { error: '코스 목록 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
