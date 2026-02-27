import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Route, RouteBookmark } from '@/types/route'

/**
 * POST /api/routes/[id]/bookmark - 코스 북마크 토글
 * Requirements: 2.4
 * - 북마크 추가/해제 토글 방식
 * - bookmarkCount 증감
 * - unique 인덱스로 중복 방지
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다' },
        { status: 401 }
      )
    }

    const { id } = await params
    const routesCollection = await getCollection<Route>('routes')
    const route = await routesCollection.findOne({ id })

    if (!route) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    const bookmarksCollection =
      await getCollection<RouteBookmark>('route_bookmarks')
    const userId = session.user.id

    // 기존 북마크 확인
    const existing = await bookmarksCollection.findOne({
      userId,
      routeId: id,
    })

    if (existing) {
      // 북마크 해제
      await bookmarksCollection.deleteOne({ userId, routeId: id })
      await routesCollection.updateOne(
        { id },
        { $inc: { bookmarkCount: -1 }, $set: { updatedAt: new Date() } }
      )

      return NextResponse.json({
        bookmarked: false,
        message: '북마크가 해제되었습니다',
      })
    } else {
      // 북마크 추가
      const bookmark: RouteBookmark = {
        id: `RB-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        routeId: id,
        userId,
        createdAt: new Date(),
      }

      await bookmarksCollection.insertOne(bookmark)
      await routesCollection.updateOne(
        { id },
        { $inc: { bookmarkCount: 1 }, $set: { updatedAt: new Date() } }
      )

      return NextResponse.json({
        bookmarked: true,
        message: '북마크에 추가되었습니다',
      })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { error: '북마크 처리에 실패했습니다' },
      { status: 500 }
    )
  }
}
