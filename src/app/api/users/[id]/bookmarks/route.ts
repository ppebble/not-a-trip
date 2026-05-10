import { NextRequest, NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import { getCollection, COLLECTIONS } from '@/lib/db'

/**
 * GET /api/users/[id]/bookmarks - 유저가 저장한 코스 목록
 * Requirements: 9.2
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id: userId } = await params

    const bookmarksCollection = await getCollection(COLLECTIONS.ROUTE_BOOKMARKS)
    const routesCollection = await getCollection(COLLECTIONS.ROUTES)
    const usersCollection = await getCollection(COLLECTIONS.USERS)

    const bookmarks = await bookmarksCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    const result = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let routeDoc = null
        try {
          routeDoc = await routesCollection.findOne({
            _id: new ObjectId(bookmark.routeId),
          })
        } catch {
          routeDoc = null
        }

        let authorName = '알 수 없음'
        if (routeDoc?.authorId) {
          try {
            const author = await usersCollection.findOne({
              _id: new ObjectId(routeDoc.authorId),
            })
            authorName = author?.name || routeDoc.authorName || '알 수 없음'
          } catch {
            authorName = routeDoc.authorName || '알 수 없음'
          }
        }

        return {
          id: bookmark.routeId,
          name: routeDoc?.name || '삭제된 코스',
          authorName,
          spotCount: routeDoc?.spots?.length ?? 0,
          bookmarkedAt:
            bookmark.createdAt instanceof Date
              ? bookmark.createdAt.toISOString()
              : bookmark.createdAt,
        }
      })
    )

    return NextResponse.json({ bookmarks: result })
  } catch (error) {
    console.error('Error fetching user bookmarks:', error)
    return NextResponse.json(
      { error: '저장한 코스 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
