import { NextRequest, NextResponse } from 'next/server'
import { getCollection, COLLECTIONS } from '@/lib/db'
import { Route } from '@/types/route'

/**
 * GET /api/contents/[name]/courses - 작품 관련 코스 조회
 * Requirements: 3.4, 3.5
 *
 * routes 컬렉션에서 relatedContentNames 필드로 매칭하여
 * 해당 작품과 연관된 공개 코스 목록을 반환한다.
 *
 * - 존재하지 않는 작품명 시 빈 배열 반환
 * - 비공개 코스는 제외 (isPublic: true 조건)
 *
 * Response: { courses: Route[], total: number }
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
): Promise<NextResponse> {
  try {
    const { name } = await params
    const contentName = decodeURIComponent(name)

    const routesCollection = await getCollection<Route>(COLLECTIONS.ROUTES)

    const courses = await routesCollection
      .find({
        isPublic: true,
        relatedContentNames: contentName,
      })
      .toArray()

    return NextResponse.json({
      courses,
      total: courses.length,
    })
  } catch (error) {
    console.error('Error fetching content courses:', error)
    return NextResponse.json(
      { error: '관련 코스 조회에 실패했습니다' },
      { status: 500 }
    )
  }
}
